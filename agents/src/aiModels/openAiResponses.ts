import OpenAI from "openai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";

import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { PsAiModelType } from "../aiModelTypes.js";

type ImageRef = { mimeType: string; data: string } | { url: string };

/**
 * Interface-compatible with OpenAiChat, but uses the Responses API.
 * - Flattens Chat Completions tool defs -> Responses tool defs
 * - Uses previous_response_id for reasoning models (with store: true)
 */
export class OpenAiResponses extends BaseChatModel {
  private client: OpenAI;
  private cfg: PsOpenAiModelConfig;
  private previousResponseId?: string;
  private sentToolOutputIds = new Set<string>();
  private lastSubmittedMessageCount = 0;

  constructor(config: PsOpenAiModelConfig) {
    let {
      apiKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY!,
      modelName = "gpt-4o",
      maxTokensOut = 16_384,
    } = config;

    super(config, modelName, maxTokensOut);

    if (process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY) {
      apiKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
      this.logger.warn(
        "Using PS_AGENT_OVERRIDE_OPENAI_API_KEY from environment variables"
      );
    }

    this.client = new OpenAI({ apiKey });
    this.cfg = { ...config, apiKey, modelName, maxTokensOut };
  }

  private attachImagesToLastUserMessage(
    inputItems: any[],
    images?: ImageRef[],
    detail: "low" | "medium" | "high" | "auto" = "auto"
  ) {
    if (!images?.length) return;

    const toImageUrl = (img: ImageRef) =>
      "url" in img ? img.url : `data:${img.mimeType};base64,${img.data}`;

    const parts = images.map((img) => ({
      type: "input_image",
      image_url: toImageUrl(img),
      detail, // Responses API accepts "auto" | "low" | "high"
    }));

    // Find the last user message; if none, create one
    for (let i = inputItems.length - 1; i >= 0; i--) {
      const item = inputItems[i];
      if (item?.role === "user") {
        if (typeof item.content === "string") {
          item.content = [{ type: "input_text", text: item.content }, ...parts];
        } else if (Array.isArray(item.content)) {
          item.content.push(...parts);
        } else {
          item.content = parts;
        }
        return;
      }
    }
    inputItems.push({ role: "user", content: parts });
  }

  /************************************  Public API  ************************************/
  async generate(
    messages: PsModelMessage[],
    streaming = false,
    streamingCallback?: (chunk: string) => void,
    /** Future vision/audio media input */
    media?: { mimeType: string; data: string }[],
    tools: ChatCompletionTool[] = [],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools: string[] = []
  ): Promise<PsBaseModelReturnParameters> {
    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(
        `Messages:\n${this.prettyPrintPromptMessages(
          messages.map((m) => ({ role: m.role, content: m.message }))
        )}`
      );
    }

    const isReasoning = this.cfg.modelType === PsAiModelType.TextReasoning;

    // Transform tool defs for Responses API
    const responsesTools = this.mapToolsForResponses(tools);
    const responsesToolChoice = this.mapToolChoiceForResponses(toolChoice);

    const hasPreviousResponse = !!this.previousResponseId;
    const hasTruncatedHistory =
      hasPreviousResponse && messages.length < this.lastSubmittedMessageCount;

    if (hasTruncatedHistory) {
      this.logger.debug(
        "Detected truncated message history; resetting Responses delta state."
      );
      this.sentToolOutputIds.clear();
      this.lastSubmittedMessageCount = 0;
      this.previousResponseId = undefined;
    }

    if (!hasPreviousResponse && this.lastSubmittedMessageCount > 0) {
      this.sentToolOutputIds.clear();
      this.lastSubmittedMessageCount = 0;
    }
    const { inputItems, instructions } = this.preprocessForResponses(
      messages,
      hasPreviousResponse,
      this.lastSubmittedMessageCount
    );

    const onlyToolOutputs =
      inputItems.length > 0 &&
      inputItems.every(
        (it) =>
          it && typeof it === "object" && it.type === "function_call_output"
      );

    if (media && media.length > 0 && !onlyToolOutputs) {
      this.logger.debug("Attaching images to last user message", media.length);
      this.attachImagesToLastUserMessage(
        inputItems,
        media,
        this.cfg.reasoningEffort ? "auto" : "auto"
      );
    }

    this.logger.debug(
      `maxTokenOut debug: ${this.cfg.maxTokensOut} ${this.maxTokensOut}`
    );

    const common: any = {
      model: this.cfg.modelName,
      input: inputItems.length ? inputItems : [{ role: "user", content: "" }],
      tools: responsesTools,
      tool_choice: responsesToolChoice,
      temperature: isReasoning ? undefined : this.cfg.temperature,
      max_output_tokens: this.cfg.maxTokensOut,
      safety_identifier: this.cfg.safetyIdentifier,
    };

    if (instructions) common.instructions = instructions;

    if (isReasoning) {
      if (this.cfg.reasoningEffort) {
        common.reasoning = { effort: this.cfg.reasoningEffort };
      }
    }

    common.store = true;
    if (this.previousResponseId) {
      common.previous_response_id = this.previousResponseId;
    }
    const logParams = JSON.parse(JSON.stringify(common));
    if (Array.isArray(logParams.input)) {
      for (const item of logParams.input) {
        if (Array.isArray(item?.content)) {
          for (const c of item.content) {
            if (typeof c?.image_url === "string" && c.image_url.length > 200) {
              c.image_url = `${c.image_url.slice(0, 200)}…`;
            }
          }
        }
      }
    }
    this.logger.debug(
      `Common model params: ${JSON.stringify(logParams, null, 2)}`
    );

    if (streaming) {
      const params = { ...common, stream: true };
      const result = await this.handleStreaming(params, streamingCallback);
      if (!onlyToolOutputs) this.lastSubmittedMessageCount = messages.length;
      return result;
    } else {
      const params = { ...common, stream: false };
      const result = await this.handleNonStreaming(params);
      if (!onlyToolOutputs) this.lastSubmittedMessageCount = messages.length;
      return result;
    }
  }

  /************************************  Helpers  ************************************/

  /**
   * Map Chat Completions tools -> Responses API tools
   * Chat: { type:"function", function:{ name, description, parameters } }
   * Responses: { type:"function", name, description, parameters }
   */
  private mapToolsForResponses(tools: ChatCompletionTool[]): any[] {
    if (!tools?.length) return [];
    return tools.map((t: any) => {
      if (t?.type === "function") {
        const fn = t.function ?? {};
        const maybeStrict =
          typeof t.strict === "boolean" ? { strict: t.strict } : {};
        return {
          type: "function",
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters,
          ...maybeStrict,
        };
      }
      // Pass through non-function tools if present (rare with Chat Completions)
      return t;
    });
  }

  /**
   * Map Chat Completions tool_choice -> Responses API tool_choice
   * - "auto" stays "auto"
   * - {type:"function", function:{name}} => {type:"function", name}
   * - "none" passes through as "none" (if caller uses it)
   */
  private mapToolChoiceForResponses(
    toolChoice: ChatCompletionToolChoiceOption | "auto"
  ): any {
    if (!toolChoice || toolChoice === "auto") return "auto";
    if ((toolChoice as any) === "none") return "none";

    const tc: any = toolChoice;
    if (typeof tc === "object") {
      if (tc.type === "function" && tc.function && tc.function.name) {
        return { type: "function", name: tc.function.name };
      }
      // Fallback: pass through (Responses will error if it doesn't like it)
      return tc;
    }
    return "auto";
  }

  private preprocessForResponses(
    msgs: PsModelMessage[],
    hasPreviousResponses: boolean,
    lastSubmittedMessageCount: number
  ): { inputItems: any[]; instructions?: string } {
    const inputItems: any[] = [];

    // Build instructions from system/developer messages (unchanged)
    const instructionParts: string[] = [];
    for (const m of msgs) {
      if ((m.role === "system" || m.role === "developer") && m.message) {
        instructionParts.push(m.message);
      }
    }
    const instructions = instructionParts.length
      ? instructionParts.join("\n\n")
      : undefined;

    if (hasPreviousResponses) {
      // Only send NEW function_call_output items that haven't been sent yet
      for (const m of msgs) {
        if (
          m.role === "tool" &&
          m.toolCallId &&
          !this.sentToolOutputIds.has(m.toolCallId)
        ) {
          inputItems.push({
            type: "function_call_output",
            call_id: m.toolCallId,
            output: m.message ?? "",
          });
          this.sentToolOutputIds.add(m.toolCallId);
        }
      }

      // If we found new tool outputs, return ONLY those (that’s what the API expects).
      if (inputItems.length > 0) {
        return { inputItems, instructions };
      }

      // Otherwise only send the delta since the last submission.
      const startIndex = Math.min(
        Math.max(lastSubmittedMessageCount, 0),
        msgs.length
      );
      for (let idx = startIndex; idx < msgs.length; idx++) {
        const msg = msgs[idx];
        if (msg.role === "user") {
          inputItems.push({ role: "user", content: msg.message ?? "" });
          continue;
        }
        if (msg.role === "assistant") {
          // Assistant messages are already stored when previous_response_id is set.
          continue;
        }
        if (msg.role === "tool") {
          // Already handled via the tool output loop above.
          continue;
        }
        if (msg.role === "system" || msg.role === "developer") {
          // Included through the instructions field.
          continue;
        }

        this.logger.error(`Unexpected message role: ${msg.role}`);

        inputItems.push({ role: msg.role, content: msg.message ?? "" });
      }

      if (inputItems.length === 0) {
        inputItems.push({ role: "user", content: "" });
      }

      return { inputItems, instructions };
    }

    // FIRST TURN / NON-CONTINUATION:
    for (const msg of msgs) {
      if (msg.role === "tool") {
        // If someone feeds us tool outputs without previous_response_id, pass them through.
        if (msg.toolCallId) {
          inputItems.push({
            type: "function_call_output",
            call_id: msg.toolCallId,
            output: msg.message ?? "",
          });
          this.sentToolOutputIds.add(msg.toolCallId);
        }
        continue;
      }

      if (msg.role === "assistant" && msg.toolCall) {
        if (msg.toolCall.id) {
          inputItems.push({
            type: "function_call",
            call_id: msg.toolCall.id,
            name: msg.toolCall.name,
            arguments: JSON.stringify(msg.toolCall.arguments),
          });
        }
        continue;
      }

      if (msg.role === "user" || msg.role === "assistant") {
        inputItems.push({ role: msg.role, content: msg.message ?? "" });
      } else {
        this.logger.error(`Unexpected message role: ${msg.role}`);
      }
    }

    if (!inputItems.length) {
      this.logger.error("No input items found for openai responses");
    }

    return { inputItems, instructions };
  }

  private async handleStreaming(
    params: any,
    onChunk?: (c: string) => void
  ): Promise<PsBaseModelReturnParameters> {
    // Responses SSE: create({ stream: true }) returns an async iterator of events
    const stream = await this.client.responses.create(params);

    let content = "";
    let finalResponse: any | undefined;

    for await (const event of stream as any) {
      const type: string | undefined = event?.type;

      // Text deltas (SDK emits either of these)
      if (
        type === "response.output_text.delta" ||
        type === "response.text.delta"
      ) {
        const delta = event?.delta ?? event?.data ?? "";
        if (delta) {
          content += delta;
          onChunk?.(delta);
        }
        continue;
      }

      if (type === "response.completed") {
        finalResponse = event.response;
        continue;
      }

      if (type === "response.error") {
        const msg =
          event.error?.message ?? "Streaming error from Responses API";
        throw new Error(msg);
      }
    }

    // Some SDK versions expose `finalResponse()`
    if (!finalResponse && typeof (stream as any).finalResponse === "function") {
      try {
        finalResponse = await (stream as any).finalResponse();
      } catch {
        // ignore; we'll fall back to content-only stats
      }
    }

    if (!finalResponse) {
      this.logger.error("No final response from Responses API");
      return {
        content,
        tokensIn: 0,
        tokensOut: 0,
        cachedInTokens: 0,
        reasoningTokens: 0,
        audioTokens: 0,
        toolCalls: [],
      };
    }

    this.previousResponseId = finalResponse?.id ?? this.previousResponseId;

    this.logger.debug(`previousResponseId: ${this.previousResponseId}`);

    const usage = finalResponse?.usage ?? {};
    const tokensIn: number = usage.input_tokens ?? usage.prompt_tokens ?? 0;
    const tokensOut: number =
      usage.output_tokens ?? usage.completion_tokens ?? 0;
    const cachedInTokens: number =
      usage.input_tokens_details?.cached_tokens ??
      usage.prompt_tokens_details?.cached_tokens ??
      0;
    const reasoningTokens: number =
      usage.output_tokens_details?.reasoning_tokens ?? 0;
    const audioTokens: number = usage.output_tokens_details?.audio_tokens ?? 0;

    const toolCalls = this.extractToolCallsFromResponse(finalResponse);

    this.logger.info(
      `Token info: ${JSON.stringify(
        {
          content,
          tokensIn,
          tokensOut,
          cachedInTokens,
          reasoningTokens,
          audioTokens,
          toolCalls,
        },
        null,
        2
      )}`
    );

    return {
      content,
      tokensIn,
      tokensOut,
      cachedInTokens,
      reasoningTokens,
      audioTokens,
      toolCalls,
    };
  }

  private async handleNonStreaming(
    params: any
  ): Promise<PsBaseModelReturnParameters> {
    const resp: any = await this.client.responses.create(params);
    this.logger.debug(`Response: ${JSON.stringify(resp, null, 2)}`);

    this.previousResponseId = resp?.id ?? this.previousResponseId;

    this.logger.debug(`previousResponseId: ${this.previousResponseId}`);

    const content: string =
      (resp as any).output_text ?? this.extractTextFromResponse(resp) ?? "";

    const usage = resp?.usage ?? {};
    const tokensIn: number = usage.input_tokens ?? usage.prompt_tokens ?? 0;
    const tokensOut: number =
      usage.output_tokens ?? usage.completion_tokens ?? 0;
    const cachedInTokens: number =
      usage.input_tokens_details?.cached_tokens ??
      usage.prompt_tokens_details?.cached_tokens ??
      0;
    const reasoningTokens: number =
      usage.output_tokens_details?.reasoning_tokens ?? 0;
    const audioTokens: number = usage.output_tokens_details?.audio_tokens ?? 0;

    const toolCalls = this.extractToolCallsFromResponse(resp);

    this.logger.debug(`Tool calls: ${JSON.stringify(toolCalls, null, 2)}`);

    this.logger.info(
      `Token info: ${JSON.stringify(
        {
          content,
          tokensIn,
          tokensOut,
          cachedInTokens,
          reasoningTokens,
          audioTokens,
          toolCalls,
        },
        null,
        2
      )}`
    );

    return {
      content,
      tokensIn,
      tokensOut,
      cachedInTokens,
      reasoningTokens,
      audioTokens,
      toolCalls,
    };
  }

  private extractTextFromResponse(resp: any): string {
    try {
      const out = resp?.output;
      if (!Array.isArray(out)) return "";
      let buffer = "";
      for (const item of out) {
        if (item?.type === "message" && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (
              c?.type === "output_text" ||
              c?.type === "text" ||
              typeof c?.text === "string"
            ) {
              buffer += c.text ?? "";
            }
          }
        }
      }
      return buffer;
    } catch {
      return "";
    }
  }

  private extractToolCallsFromResponse(resp: any): ToolCall[] {
    const calls: ToolCall[] = [];
    try {
      const out = resp?.output;
      if (!Array.isArray(out)) return calls;

      for (const item of out) {
        if (item?.type === "function_call") {
          const rawArgs = item?.arguments ?? "";
          let parsed: any = {};
          try {
            parsed = rawArgs ? JSON.parse(rawArgs) : {};
          } catch {
            parsed = {};
          }
          calls.push({
            id: item?.call_id ?? item?.id ?? "",
            name: item?.name ?? "",
            arguments: parsed,
          });
        }
      }
    } catch {
      // ignore
    }
    return calls;
  }
}

export default OpenAiResponses;
