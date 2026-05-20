import OpenAI from "openai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsBase,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";

import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";

import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PsAiModel } from "../dbModels/aiModel.js";

type UsageItemPayload = PsModelUsageItemProviderData;
type UsageItemResult = PsBaseModelReturnParameters;

export class OpenAiChat extends BaseChatModel {
  private client: OpenAI;
  private cfg: PsOpenAiModelConfig;
  private requestedInferenceType?: PsInferenceType;

  private getRequestedServiceTier():
    | PsOpenAiInferenceType
    | undefined {
    if (this.cfg.inferenceType === "fast") {
      return "priority";
    }

    if (
      this.cfg.inferenceType === "flex" ||
      this.cfg.inferenceType === "priority"
    ) {
      return this.cfg.inferenceType;
    }

    return undefined;
  }

  constructor(config: PsOpenAiModelConfig) {
    let {
      apiKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY!,
      modelName = "gpt-4o",
      maxTokensOut = 16_384,
    } = config;

    super(config, modelName, maxTokensOut);

    if (process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY) {
      apiKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
      this.logger.warn("Using PS_AGENT_OVERRIDE_OPENAI_API_KEY from environment variables");
    }

    const enforceEuRegion = process.env.OPENAI_ENFORCE_EU_REGION === "true";
    const effectiveRegionalProcessing =
      config.regionalProcessing === "eu" || enforceEuRegion ? "eu" : undefined;
    const effectiveInferenceType =
      config.inferenceType === "fast" ? "priority" : config.inferenceType;
    if (enforceEuRegion) {
      this.logger.info(
        "OPENAI_ENFORCE_EU_REGION is enabled; forcing OpenAI regional processing to eu"
      );
    }
    const baseURL =
      effectiveRegionalProcessing === "eu"
        ? "https://eu.api.openai.com/v1"
        : undefined;
    this.client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    if (baseURL) {
      this.logger.info(`Using OpenAI regional processing endpoint ${baseURL}`);
    }
    this.cfg = {
      ...config,
      apiKey,
      modelName,
      inferenceType: effectiveInferenceType,
      maxTokensOut,
      regionalProcessing: effectiveRegionalProcessing,
    };
    this.config = this.cfg;
    this.requestedInferenceType = config.inferenceType;
    if (config.inferenceType === "fast") {
      this.logger.info(
        "Mapping inferenceType=fast to OpenAI service_tier=priority"
      );
    }
  }

  /************************************  Public API  ************************************/
  async generate(
    messages: PsModelMessage[],
    streaming = false,
    streamingCallback?: (chunk: string) => void,
    /** Future vision/audio media input */
    media?: { mimeType: string; data: string }[],
    tools: ChatCompletionTool[] = [],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools: string[] = [],
    requestOptions?: PsModelRequestOptions
  ): Promise<PsBaseModelReturnParameters> {
    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(
        `Messages:\n${this.prettyPrintPromptMessages(messages.map((m) => ({
          role: m.role,
          content: m.message,
        })))}`
      );
    }

    const formatted: ChatCompletionMessageParam[] =
      this.preprocessMessages(messages);

    const logitBias = this.buildLogitBias(tools, allowedTools);

    const isReasoning = this.cfg.modelType === PsAiModelType.TextReasoning;

    const common: Omit<
      ChatCompletionCreateParamsBase,
      "stream" | "max_tokens" | "max_completion_tokens"
    > = {
      model: String(this.getApiModelName()),
      messages: formatted,
      tools,
      tool_choice: toolChoice,
      safety_identifier:
        requestOptions?.safetyIdentifier ?? this.cfg.safetyIdentifier,
      service_tier: this.getRequestedServiceTier(),
      logit_bias: isReasoning ? undefined : logitBias,
      temperature: isReasoning ? undefined : this.cfg.temperature,
      reasoning_effort: isReasoning
        ? (this.cfg.reasoningEffort === 'max' ? 'xhigh' : this.cfg.reasoningEffort)
        : undefined,
     // parallel_tool_calls: this.cfg.parallelToolCalls === true,
    };

    /* ------------------------------------------------------------------ *
     * 4  Streaming vs Non‑streaming                                      *
     * ------------------------------------------------------------------ */
    if (streaming) {
      const params: ChatCompletionCreateParamsStreaming = {
        ...common,
        stream: true,
        max_completion_tokens: isReasoning ? this.cfg.maxTokensOut : undefined,
        max_tokens: isReasoning ? undefined : this.cfg.maxTokensOut,
        stream_options: { include_usage: true },
      };

      return await this.handleStreaming(params, streamingCallback);
    } else {
      const params: ChatCompletionCreateParamsNonStreaming = {
        ...common,
        stream: false,
        max_completion_tokens: isReasoning ? this.cfg.maxTokensOut : undefined,
        max_tokens: isReasoning ? undefined : this.cfg.maxTokensOut,
      };

      return await this.handleNonStreaming(params);
    }
  }

  /************************************  Helpers  ************************************/

  private preprocessMessages(
    msgs: PsModelMessage[]
  ): ChatCompletionMessageParam[] {
    const m = [...msgs];

    /* ------------------------------------------------------------------ *
     *  Map internal message structure → OpenAI-SDK message parameters   *
     * ------------------------------------------------------------------ */
    return m.flatMap((msg): ChatCompletionMessageParam[] => {
      if (msg.role === "assistant" && msg.phase === "commentary") {
        return [];
      }

      if (msg.role === "tool") {
        return [{
          role: "tool",
          content: msg.message,
          tool_call_id: msg.toolCallId!,
        } as any];
      }

      const base: any = {
        role: msg.role,
        content: msg.message,
      };
      if (msg.name) base.name = msg.name;
      if (msg.toolCall) {
        base.tool_calls = [
          {
            type: "function",
            id: msg.toolCall.id,
            function: {
              name: msg.toolCall.name,
              arguments: JSON.stringify(msg.toolCall.arguments ?? {}),
            },
          },
        ];
      }
      return [base];
    });
  }

  /** Build negative logit‑bias array if the caller limited tool usage. */
  private buildLogitBias(
    tools: ChatCompletionTool[],
    allowed: string[]
  ): Record<number, number> | undefined {
    if (!allowed.length || !tools.length) return undefined;

    try {
      const enc = encoding_for_model(
        String(this.getApiModelName()) as TiktokenModel
      );
      const bias: Record<number, number> = {};

      for (const t of tools) {
        const name = t.type === "function" ? t.function.name : "";
        if (!allowed.includes(name)) {
          enc.encode(name).forEach((tok) => (bias[tok] = -100));
        }
      }
      enc.free();
      return bias;
    } catch (err) {
      this.logger.warn(`Encoding failed for logit bias: ${err}`);
      return undefined;
    }
  }

  private buildUsageItemData(
    response: {
      id?: string | null;
      service_tier?: string | null;
      usage?: Record<string, unknown> | null;
    },
    request: {
      stream: boolean;
      toolChoice: ChatCompletionToolChoiceOption | "auto";
      toolCount: number;
    },
    usage: {
      tokensIn: number;
      tokensOut: number;
      cachedInTokens: number;
      reasoningTokens: number;
      audioTokens: number;
    }
  ): UsageItemPayload {
    return {
      provider: "openai",
      apiFamily: "openai.chat.completions",
      transport: "openai",
      modelName: this.cfg.modelName,
      request: {
        stream: request.stream,
        apiModelName: String(this.getApiModelName()),
        toolChoice: request.toolChoice,
        toolCount: request.toolCount,
        requestedInferenceType: this.requestedInferenceType ?? null,
        requestedServiceTier: this.getRequestedServiceTier() ?? null,
        regionalProcessing: this.cfg.regionalProcessing ?? null,
        reasoningEffort: this.cfg.reasoningEffort ?? null,
        maxTokensOut: this.cfg.maxTokensOut ?? null,
      },
      usageRaw: response.usage ?? undefined,
      usageNormalized: {
        tokensIn: usage.tokensIn,
        tokensOut: usage.tokensOut,
        cachedInTokens: usage.cachedInTokens,
        reasoningTokens: usage.reasoningTokens,
        audioTokens: usage.audioTokens,
      },
      providerMetadata: {
        transport: "openai",
        responseId: response.id ?? null,
        appliedServiceTier: response.service_tier ?? null,
        regionalProcessing: this.cfg.regionalProcessing ?? null,
        apiModelName: String(this.getApiModelName()),
      },
    };
  }

  private async handleStreaming(
    params: ChatCompletionCreateParamsStreaming,
    onChunk?: (c: string) => void
  ): Promise<PsBaseModelReturnParameters> {
    const stream = this.client.chat.completions.stream(params);

    let content = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        content += delta.content;
        onChunk?.(delta.content);
      }
    }

    const results = await stream.finalChatCompletion();

    const toolCalls = this.handleToolCalls(
      results.choices[0]?.message?.tool_calls ?? []
    );

    const usageItemData = this.buildUsageItemData(
      {
        id: results.id ?? null,
        service_tier: (results as { service_tier?: string | null }).service_tier,
        usage: (results.usage ?? null) as unknown as Record<string, unknown> | null,
      },
      {
        stream: true,
        toolChoice: params.tool_choice ?? "auto",
        toolCount: params.tools?.length ?? 0,
      },
      {
        tokensIn: results.usage?.prompt_tokens ?? 0,
        tokensOut: results.usage?.completion_tokens ?? 0,
        cachedInTokens: results.usage?.prompt_tokens_details?.cached_tokens ?? 0,
        reasoningTokens:
          results.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
        audioTokens: results.usage?.completion_tokens_details?.audio_tokens ?? 0,
      }
    );

    const result: UsageItemResult = {
      content,
      tokensIn: results.usage?.prompt_tokens ?? 0,
      tokensOut: results.usage?.completion_tokens ?? 0,
      cachedInTokens: results.usage?.prompt_tokens_details?.cached_tokens ?? 0,
      reasoningTokens:
        results.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
      audioTokens: results.usage?.completion_tokens_details?.audio_tokens ?? 0,
      toolCalls: toolCalls,
      usageItemData,
    };

    return result;
  }

  private async handleNonStreaming(
    params: ChatCompletionCreateParamsNonStreaming
  ): Promise<PsBaseModelReturnParameters> {
    const resp = await this.client.chat.completions.create(params);

    const msg = resp.choices[0].message;
    const content = msg.content ?? "";

    const toolCalls = this.handleToolCalls(msg.tool_calls ?? []);

    const usage = resp.usage!;
    const usageItemData = this.buildUsageItemData(
      {
        id: resp.id ?? null,
        service_tier: (resp as { service_tier?: string | null }).service_tier,
        usage: (usage ?? null) as unknown as Record<string, unknown> | null,
      },
      {
        stream: false,
        toolChoice: params.tool_choice ?? "auto",
        toolCount: params.tools?.length ?? 0,
      },
      {
        tokensIn: usage.prompt_tokens,
        tokensOut: usage.completion_tokens,
        cachedInTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
        reasoningTokens: usage.completion_tokens_details?.reasoning_tokens ?? 0,
        audioTokens: usage.completion_tokens_details?.audio_tokens ?? 0,
      }
    );

    const result: UsageItemResult = {
      content,
      tokensIn: usage.prompt_tokens,
      tokensOut: usage.completion_tokens,
      cachedInTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
      reasoningTokens: usage.completion_tokens_details?.reasoning_tokens ?? 0,
      audioTokens: usage.completion_tokens_details?.audio_tokens ?? 0,
      toolCalls,
      usageItemData,
    };

    return result;
  }

  private handleToolCalls(
    tool_calls: ChatCompletionMessageToolCall[]
  ): ToolCall[] {
    const toolCalls: ToolCall[] = [];

    if (tool_calls?.length) {
      for (const tc of tool_calls) {
        if (tc.type === "function") {
          try {
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: JSON.parse(tc.function.arguments || "{}"),
            });
          } catch {
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: {},
            });
          }
        }
      }
    }
    return toolCalls;
  }
}

export default OpenAiChat;
