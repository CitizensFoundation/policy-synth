import Anthropic from "@anthropic-ai/sdk";
import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import type {
  ContentBlock,
  ContentBlockParam,
  ImageBlockParam,
  MessageParam,
  TextBlockParam,
  Tool,
  ToolChoice,
  ToolResultBlockParam,
  ToolUseBlockParam,
} from "@anthropic-ai/sdk/resources/messages/messages.js";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";

const mapToBedrockModelId = (modelName: string): string => {
  // If caller already supplied a full inference profile or Bedrock model id, keep it.
  if (modelName.includes(":")) {
    return modelName;
  }

  const v2Models = new Set<string>(["claude-3-5-sonnet-20241022"]);
  const suffix = v2Models.has(modelName) ? "-v2:0" : "-v1:0";

  // Bedrock model ids are prefixed with "anthropic."
  const prefixed = modelName.startsWith("anthropic.")
    ? modelName
    : `anthropic.${modelName}`;

  return `${prefixed}${suffix}`;
};

const buildInferenceProfileId = (
  modelName: string,
  preferredRegionSlug = "eu"
): string => {
  const explicit = process.env.AWS_INFERENCE_PROFILE?.trim();
  const baseId = mapToBedrockModelId(modelName); // e.g. anthropic.claude-opus-4-5-20251101-v1:0

  // Helper: prefix a slug if provided and non-empty
  const prefixWith = (slug: string) => `${slug}.${baseId}`;

  // 1) Explicit override via env var
  if (explicit) {
    const isOpus45 = baseId.includes("claude-opus-4-5-20251101");

    // If caller forces Opus 4.5 to a geography that doesn't exist, keep it working by falling back to GLOBAL.
    if (!explicit.startsWith("global") && isOpus45 && !explicit.includes(":")) {
      return prefixWith("global");
    }

    // Full inference profile ID provided
    if (explicit.includes(":")) {
      return explicit;
    }
    // Shorthand like "global" / "eu" / "us" etc.
    return prefixWith(explicit);
  }

  // 2) If caller already passed a full profile id
  if (/^(global|us|eu|ap|ca|sa|af|jp)\./.test(modelName) && modelName.includes(":")) {
    return modelName;
  }

  // 3) Opus 4.5 is only exposed via the GLOBAL inference profile today.
  if (baseId.includes("claude-opus-4-5-20251101")) {
    return prefixWith("global");
  }

  // 4) Default to the regional system profile (keep data closer if available)
  return prefixWith(preferredRegionSlug);
};
export class ClaudeChat extends BaseChatModel {
  private client: Anthropic | AnthropicBedrock;
  private usingBedrock: boolean;
  private maxThinkingTokens?: number;
  config: PsAiModelConfig;

  constructor(config: PsAiModelConfig) {
    const {
      apiKey,
      modelName = "claude-3-opus-20240229",
      maxTokensOut = 4096,
    } = config;

    const useBedrock = Boolean(process.env.AWS_BEARER_TOKEN_BEDROCK);
    const resolvedModelName = useBedrock
      ? buildInferenceProfileId(modelName, "eu")
      : modelName;

    super(config, resolvedModelName, maxTokensOut);

    this.maxThinkingTokens =
      config.maxThinkingTokens ??
      this.mapReasoningEffortToThinkingBudget(config.reasoningEffort);
    this.usingBedrock = useBedrock;

    if (useBedrock) {
      const preferredRegion =
        process.env.AWS_REGION ??
        process.env.AWS_DEFAULT_REGION ??
        "eu-west-1";
      // Claude Opus 4.5 global profile only works from specific source regions; fall back if unsupported.
      // Source regions allowed for GLOBAL Anthropic profiles (AWS Bedrock doc, Nov 2025)
      const supportedGlobalRegions = new Set([
        "us-west-2",
        "us-east-1",
        "us-east-2",
        "eu-west-1",
        "eu-north-1",
        "eu-west-2",
        "ap-northeast-1",
      ]);
      const region =
        resolvedModelName.startsWith("global.") &&
        !supportedGlobalRegions.has(preferredRegion)
          ? "eu-west-1" // safest EU source Region supported by GLOBAL profiles
          : preferredRegion;
      const bearer = process.env.AWS_BEARER_TOKEN_BEDROCK!;
      const baseURL =
        process.env.ANTHROPIC_BEDROCK_BASE_URL ??
        `https://bedrock-runtime.${region}.amazonaws.com`;

      this.client = new AnthropicBedrock({
        awsRegion: region,
        baseURL,
        skipAuth: true,
        defaultHeaders: {
          Authorization: `Bearer ${bearer}`,
          "x-amz-bedrock-region": region,
        },
      });
      this.logger.info?.(
        `Using Amazon Bedrock for Claude with region=${region}, model=${resolvedModelName}`
      );
      if (
        resolvedModelName.startsWith("global.") &&
        !supportedGlobalRegions.has(region)
      ) {
        this.logger.warn?.(
          `AWS region ${region} is not in the supported list for global inference profiles (us-west-2, us-east-1, us-east-2, eu-west-1, ap-northeast-1); requests may fail`
        );
      }
    } else {
      this.client = new Anthropic({ apiKey });
    }
    this.config = { ...config, modelName: resolvedModelName };
  }

  async generate(
    messages: PsModelMessage[],
    streaming = false,
    streamingCallback?: Function,
    media?: { mimeType: string; data: string }[],
    tools: ChatCompletionTool[] = [],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools: string[] = []
  ): Promise<PsBaseModelReturnParameters | undefined> {
    this.logger.debug(
      `Model config: type=${this.config.modelType}, size=${this.config.modelSize}, ` +
        `effort=${this.config.reasoningEffort}, maxtemp=${this.config.temperature}, ` +
        `maxTokens=${this.config.maxTokensOut}, maxThinkingTokens=${this.config.maxThinkingTokens}, ` +
        `bedrock=${this.usingBedrock === true}`
    );

    const { system, messages: anthropicMessages } = this.formatMessages(
      messages,
      media
    );

    if (!anthropicMessages.length) {
      anthropicMessages.push({ role: "user", content: [{ type: "text", text: "" }] });
    }

    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(
        `Messages:\n${this.prettyPrintPromptMessages(
          anthropicMessages.map((m) => ({
            role: m.role,
            content: JSON.stringify(m.content),
          }))
        )}`
      );
    }

    const filteredTools = this.buildTools(tools, allowedTools);
    const choice = this.mapToolChoice(toolChoice, filteredTools.length > 0);

    const requestOptions: Anthropic.MessageCreateParams = {
      max_tokens: this.maxTokensOut,
      messages: anthropicMessages,
      model: this.modelName,
      temperature: this.config.temperature,
      thinking: this.maxThinkingTokens
        ? {
            type: "enabled",
            budget_tokens: this.maxThinkingTokens!,
          }
        : undefined,
      tools: filteredTools.length ? filteredTools : undefined,
      tool_choice: filteredTools.length ? choice : undefined,
      system,
    };

    if (streaming) {
      const stream = await this.client.messages.stream(requestOptions);

      let aggregated = "";
      const toolCalls: ToolCall[] = [];

      for await (const messageStreamEvent of stream) {
        if (streamingCallback) {
          streamingCallback(messageStreamEvent);
        }

        if (messageStreamEvent.type === "content_block_start") {
          if (messageStreamEvent.content_block.type === "text") {
            aggregated += messageStreamEvent.content_block.text;
          } else if (messageStreamEvent.content_block.type === "tool_use") {
            toolCalls.push({
              id: messageStreamEvent.content_block.id ?? "",
              name: messageStreamEvent.content_block.name ?? "unknown",
              arguments: this.normalizeToolInput(
                messageStreamEvent.content_block.input
              ),
            });
          }
        } else if (
          messageStreamEvent.type === "content_block_delta" &&
          messageStreamEvent.delta.type === "text_delta"
        ) {
          aggregated += messageStreamEvent.delta.text;
        }
      }

      const finalMessage = await stream.finalMessage();
      let tokensIn = finalMessage.usage.input_tokens ?? 0;
      let tokensOut = finalMessage.usage.output_tokens ?? 0;
      const cachedInTokens = finalMessage.usage.cache_creation_input_tokens ?? 0;

      if (finalMessage.usage.cache_creation_input_tokens != null) {
        tokensIn += finalMessage.usage.cache_creation_input_tokens * 1.25;
      }

      if (finalMessage.usage.cache_read_input_tokens != null) {
        tokensIn += finalMessage.usage.cache_read_input_tokens * 0.1;
      }

      const mergedToolCalls = this.mergeToolCalls(
        toolCalls,
        this.extractToolCalls(finalMessage.content)
      );

      return {
        tokensIn,
        tokensOut,
        cachedInTokens,
        content: aggregated || this.getTextTypeFromContent(finalMessage.content),
        toolCalls: mergedToolCalls,
      };
    } else {
      const response = await this.client.messages.create(requestOptions);
      this.logger.debug(`Generated response: ${JSON.stringify(response, null, 2)}`);
      let tokensIn = response.usage.input_tokens ?? 0;
      let tokensOut = response.usage.output_tokens ?? 0;
      const cachedInTokens = response.usage.cache_creation_input_tokens ?? 0;

      if (response.usage.cache_creation_input_tokens != null) {
        tokensIn += response.usage.cache_creation_input_tokens * 1.25;
      }

      if (response.usage.cache_read_input_tokens != null) {
        tokensIn += response.usage.cache_read_input_tokens * 0.1;
      }
      const toolCalls = this.extractToolCalls(response.content);
      return {
        tokensIn: tokensIn,
        tokensOut: tokensOut,
        cachedInTokens,
        content: this.getTextTypeFromContent(response.content),
        toolCalls,
      };
    }
  }

  private formatMessages(
    messages: PsModelMessage[],
    media?: { mimeType: string; data: string }[]
  ): { system?: string | TextBlockParam[]; messages: MessageParam[] } {
    const systemParts: string[] = [];
    const formatted: MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === "system" || msg.role === "developer") {
        if (msg.message) {
          systemParts.push(msg.message);
        }
        continue;
      }

      if (msg.role === "user") {
        formatted.push({
          role: "user",
          content: this.buildUserContentBlocks(msg.message),
        });
        continue;
      }

      if (msg.role === "assistant") {
        formatted.push({
          role: "assistant",
          content: this.buildAssistantContentBlocks(msg),
        });
        continue;
      }

      if (msg.role === "tool") {
        formatted.push({
          role: "user",
          content: [this.buildToolResultBlock(msg)],
        });
        continue;
      }

      this.logger.warn(`Skipping unsupported role for Claude: ${msg.role}`);
    }

    this.attachMediaBlocks(formatted, media);

    const system =
      systemParts.length > 0
        ? [
            {
              type: "text",
              text: systemParts.join("\n\n"),
              cache_control: { type: "ephemeral" },
            } satisfies TextBlockParam,
          ]
        : undefined;

    return { system, messages: formatted };
  }

  private buildUserContentBlocks(text?: string): ContentBlockParam[] {
    if (text !== undefined && text !== null) {
      return [{ type: "text", text }];
    }
    return [{ type: "text", text: "" }];
  }

  private buildAssistantContentBlocks(
    message: PsModelMessage
  ): ContentBlockParam[] {
    const blocks: ContentBlockParam[] = [];
    if (message.message) {
      blocks.push({ type: "text", text: message.message });
    }

    if (message.toolCall) {
      const toolBlock: ToolUseBlockParam = {
        type: "tool_use",
        id: message.toolCall.id,
        name: message.toolCall.name,
        input: this.normalizeToolInput(message.toolCall.arguments),
      };
      blocks.push(toolBlock);
    }

    if (!blocks.length) {
      blocks.push({ type: "text", text: "" });
    }

    return blocks;
  }

  private buildToolResultBlock(message: PsModelMessage): ToolResultBlockParam {
    const toolUseId =
      message.toolCallId ??
      message.toolCall?.id ??
      message.toolCall?.name ??
      message.name ??
      "tool_call";

    if (!message.toolCallId && !message.toolCall?.id) {
      this.logger.warn?.(
        `Tool result is missing toolCallId for tool ${message.name ?? "unknown"}`
      );
    }

    return {
      type: "tool_result",
      tool_use_id: toolUseId,
      content: message.message ?? "",
    };
  }

  private attachMediaBlocks(
    formattedMessages: MessageParam[],
    media?: { mimeType: string; data: string }[]
  ) {
    if (!media || media.length === 0) {
      return;
    }

    const imageBlocks: ImageBlockParam[] = media
      .map((item) => this.toImageBlock(item))
      .filter((block): block is ImageBlockParam => Boolean(block));

    if (!imageBlocks.length) {
      return;
    }

    for (let i = formattedMessages.length - 1; i >= 0; i -= 1) {
      const msg = formattedMessages[i];
      if (msg.role === "user") {
        const contentArray: ContentBlockParam[] = Array.isArray(msg.content)
          ? [...msg.content, ...imageBlocks]
          : [{ type: "text", text: String(msg.content) }, ...imageBlocks];
        formattedMessages[i] = { ...msg, content: contentArray };
        return;
      }
    }

    formattedMessages.push({ role: "user", content: imageBlocks });
  }

  private toImageBlock(media: {
    mimeType: string;
    data: string;
  }): ImageBlockParam | undefined {
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ]);

    if (!allowedTypes.has(media.mimeType)) {
      this.logger.warn(
        `Unsupported image mime type for Claude: ${media.mimeType}, skipping.`
      );
      return undefined;
    }

    return {
      type: "image",
      source: {
        type: "base64",
        media_type: media.mimeType as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp",
        data: media.data,
      },
    };
  }

  private buildTools(
    tools: ChatCompletionTool[],
    allowedTools: string[]
  ): Tool[] {
    if (!tools || !tools.length) {
      return [];
    }

    const allowSet = allowedTools.length ? new Set(allowedTools) : undefined;
    type FunctionTool = ChatCompletionTool & {
      type: "function";
      function: {
        name: string;
        description?: string;
        parameters?: Record<string, unknown>;
      };
    };

    const functionTools = tools.filter(
      (tool): tool is FunctionTool => tool.type === "function"
    );

    const filtered = allowSet
      ? functionTools.filter((tool) => allowSet.has(tool.function.name))
      : functionTools;

    return filtered.map((tool) => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: {
        type: "object",
        ...(tool.function.parameters ?? {}),
      },
    }));
  }

  private mapToolChoice(
    toolChoice: ChatCompletionToolChoiceOption | "auto",
    hasTools: boolean
  ): ToolChoice | undefined {
    if (!hasTools) {
      return undefined;
    }

    const disableParallel =
      this.config.parallelToolCalls === false ? true : undefined;

    if (toolChoice === "none") {
      return { type: "none" };
    }

    if (toolChoice === "required") {
      return { type: "any", disable_parallel_tool_use: disableParallel };
    }

    if (toolChoice === "auto" || toolChoice == null) {
      return { type: "auto", disable_parallel_tool_use: disableParallel };
    }

    if (typeof toolChoice === "object" && toolChoice.type === "function") {
      return {
        type: "tool",
        name: toolChoice.function.name,
        disable_parallel_tool_use: disableParallel,
      };
    }

    return { type: "auto", disable_parallel_tool_use: disableParallel };
  }

  private normalizeToolInput(input: unknown): Record<string, unknown> {
    if (input === null || input === undefined) {
      return {};
    }

    if (typeof input === "object" && !Array.isArray(input)) {
      return input as Record<string, unknown>;
    }

    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // ignore parse failures
      }
      return { value: input };
    }

    return { value: input };
  }

  private extractToolCalls(content: ContentBlock[]): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    for (const block of content) {
      if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id ?? "",
          name: block.name ?? "unknown",
          arguments: this.normalizeToolInput(block.input),
        });
      }
    }
    return toolCalls;
  }

  private mergeToolCalls(
    primary: ToolCall[],
    secondary: ToolCall[]
  ): ToolCall[] {
    if (!secondary.length) {
      return primary;
    }

    const seen = new Set(primary.map((c) => c.id));
    const merged = [...primary];

    for (const call of secondary) {
      if (call.id && seen.has(call.id)) {
        continue;
      }
      if (call.id) {
        seen.add(call.id);
      }
      merged.push(call);
    }

    return merged;
  }

  private mapReasoningEffortToThinkingBudget(
    effort?: "low" | "medium" | "high"
  ): number | undefined {
    switch (effort) {
      case "low":
        return 8_000;
      case "medium":
        return 32_000;
      case "high":
        return 64_000;
      default:
        return undefined;
    }
  }

  getTextTypeFromContent(content: ContentBlock[]): string {
    const texts: string[] = [];
    for (const block of content) {
      if (block.type === "text") {
        texts.push(block.text);
      }
    }
    return texts.join("");
  }

  async getEstimatedNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number> {
    //TODO: Get the right encoding
    const encoding = encoding_for_model(
      /*this.modelName*/ "gpt-4o" as TiktokenModel
    );
    const formattedMessages = messages.map((msg) => msg.message).join(" ");
    const tokenCount = encoding.encode(formattedMessages).length;
    return Promise.resolve(tokenCount);
  }
}

export default ClaudeChat;
