import OpenAI from "openai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsBase,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/chat/completions";

import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";

import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PsAiModel } from "../dbModels/aiModel.js";

export class OpenAiChat extends BaseChatModel {
  private client: OpenAI;
  private cfg: PsOpenAiModelConfig;

  constructor(config: PsOpenAiModelConfig) {
    const {
      apiKey = process.env.PS_AGENT_OPENAI_API_KEY!,
      modelName = "gpt-4o",
      maxTokensOut = 16_384,
    } = config;

    super(config, modelName, maxTokensOut);

    this.client = new OpenAI({ apiKey });
    this.cfg = { ...config, apiKey, modelName, maxTokensOut };
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
    allowedTools: string[] = []
  ): Promise<PsBaseModelReturnParameters> {
    /* ------------------------------------------------------------------ *
     * 1  Translate internal message format → OpenAI message params        *
     * ------------------------------------------------------------------ */
    const formatted: ChatCompletionMessageParam[] =
      this.preprocessMessages(messages);

    /* ------------------------------------------------------------------ *
     * 2  Optional logit‑bias to suppress not‑allowed tools                *
     * ------------------------------------------------------------------ */
    const logitBias = this.buildLogitBias(tools, allowedTools);

    /* ------------------------------------------------------------------ *
     * 3  Build base parameter object (shared by streaming & sync paths)   *
     * ------------------------------------------------------------------ */
    const isReasoning = this.cfg.modelType === PsAiModelType.TextReasoning;

    const common: Omit<
      ChatCompletionCreateParamsBase,
      "stream" | "max_tokens" | "max_completion_tokens"
    > = {
      model: this.cfg.modelName,
      messages: formatted,
      tools,
      tool_choice: toolChoice,
      logit_bias: logitBias,
      temperature: isReasoning ? undefined : this.cfg.temperature,
      reasoning_effort: isReasoning ? this.cfg.reasoningEffort : undefined,
      parallel_tool_calls: this.cfg.parallelToolCalls,
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
    return m.map((msg): ChatCompletionMessageParam => {
      return {
        role: msg.role as "system" | "developer" | "user" | "assistant",
        content: msg.message,
        name: msg.name,
        tool_calls: msg.toolCall
          ? [
              {
                type: "function",
                id: msg.toolCall.id,
                function: {
                  name: msg.toolCall.name,
                  arguments: JSON.stringify(msg.toolCall.arguments ?? {}),
                },
              },
            ]
          : undefined,
      };
    });
  }

  /** Build negative logit‑bias array if the caller limited tool usage. */
  private buildLogitBias(
    tools: ChatCompletionTool[],
    allowed: string[]
  ): Record<number, number> | undefined {
    if (!allowed.length || !tools.length) return undefined;

    try {
      const enc = encoding_for_model(this.cfg.modelName as TiktokenModel);
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

  /** Handle streaming call, accumulate tool‑calls + usage stats. */
  private async handleStreaming(
    params: ChatCompletionCreateParamsStreaming,
    onChunk?: (c: string) => void
  ): Promise<PsBaseModelReturnParameters> {
    const stream = await this.client.chat.completions.create(params);

    let content = "";
    const toolCallsAccum: Record<
      number,
      { id: string; name?: string; args: string }
    > = {};

    // Usage summary (only sent in final chunk)
    let usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      prompt_tokens_details: { cached_tokens: 0 },
      completion_tokens_details: {
        reasoning_tokens: 0,
        audio_tokens: 0,
      },
    } as any;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        content += delta.content;
        onChunk?.(delta.content);
      }

      if (delta?.tool_calls) {
        for (const call of delta.tool_calls) {
          const idx = call.index ?? 0;
          const acc = toolCallsAccum[idx] ?? { id: call.id, args: "" };
          if (call.function?.name) acc.name = call.function.name;
          if (call.function?.arguments) acc.args += call.function.arguments;
          toolCallsAccum[idx] = acc;
        }
      }

      if (chunk.usage) usage = chunk.usage;
    }

    const toolCalls: ToolCall[] = [];
    for (const v of Object.values(toolCallsAccum)) {
      if (v.name) {
        try {
          toolCalls.push({
            id: v.id,
            name: v.name,
            arguments: JSON.parse(v.args || "{}"),
          });
        } catch {
          toolCalls.push({ id: v.id, name: v.name, arguments: {} });
        }
      }
    }

    return {
      content,
      tokensIn: usage.prompt_tokens,
      tokensOut: usage.completion_tokens,
      cachedInTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
      reasoningTokens: usage.completion_tokens_details?.reasoning_tokens ?? 0,
      audioTokens: usage.completion_tokens_details?.audio_tokens ?? 0,
      toolCalls,
    };
  }

  /** Handle blocking (non‑stream) call. */
  private async handleNonStreaming(
    params: ChatCompletionCreateParamsNonStreaming
  ): Promise<PsBaseModelReturnParameters> {
    const resp = await this.client.chat.completions.create(params);

    const msg = resp.choices[0].message;
    const content = msg.content ?? "";

    const toolCalls: ToolCall[] = [];
    if (msg.tool_calls?.length) {
      for (const tc of msg.tool_calls) {
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

    const usage = resp.usage!;
    return {
      content,
      tokensIn: usage.prompt_tokens,
      tokensOut: usage.completion_tokens,
      cachedInTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
      reasoningTokens: usage.completion_tokens_details?.reasoning_tokens ?? 0,
      audioTokens: usage.completion_tokens_details?.audio_tokens ?? 0,
      toolCalls,
    };
  }
}

export default OpenAiChat;
