import OpenAI from "openai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsBase, // kept for parity with existing types in your codebase
  ChatCompletionCreateParamsStreaming,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";

import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";

import { PsAiModelType } from "../aiModelTypes.js";

/**
 * NOTE:
 * - Interface-compatible with OpenAiChat.
 * - Uses Responses API under the hood.
 * - When using reasoning models, sends `previous_response_id` (and `store: true`) to reuse prior reasoning items.
 */

export class OpenAiResponses extends BaseChatModel {
  private client: OpenAI;
  private cfg: PsOpenAiModelConfig;

  // Track last response id so we can chain with `previous_response_id` for reasoning models
  private previousResponseId?: string;

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
    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(
        `Messages:\n${this.prettyPrintPromptMessages(
          messages.map((m) => ({
            role: m.role,
            content: m.message,
          }))
        )}`
      );
    }

    const isReasoning = this.cfg.modelType === PsAiModelType.TextReasoning;

    // Build Responses API input + (optional) instructions
    const { inputItems, instructions } = this.preprocessForResponses(
      messages,
      isReasoning && !!this.previousResponseId
    );

    // Common request payload for Responses API
    // - We use `max_output_tokens` (Responses API) instead of max_tokens / max_completion_tokens.
    // - For reasoning models, use `reasoning: { effort: ... }` (instead of reasoning_effort).
    const common: any = {
      model: this.cfg.modelName,
      input: inputItems.length ? inputItems : [{ role: "user", content: "" }],
      tools: tools as any, // Types differ between endpoints; pass-through keeps interface parity.
      tool_choice: toolChoice as any,
      temperature: isReasoning ? undefined : this.cfg.temperature,
      max_output_tokens: this.cfg.maxTokensOut,
    };

    if (instructions) {
      common.instructions = instructions;
    }

    if (isReasoning) {
      // Use Responses API reasoning parameters
      if (this.cfg.reasoningEffort) {
        common.reasoning = { effort: this.cfg.reasoningEffort };
      }
      // Persist state so previous_response_id is meaningful across turns
      common.store = true;
      if (this.previousResponseId) {
        common.previous_response_id = this.previousResponseId;
      }
    }

    /* ------------------------------------------------------------------ *
     * 4  Streaming vs Non‑streaming                                      *
     * ------------------------------------------------------------------ */
    if (streaming) {
      // The Responses API streams Server-Sent Events (SSE) with typed events.
      const params = {
        ...common,
        stream: true,
      };

      return await this.handleStreaming(params, streamingCallback);
    } else {
      const params = {
        ...common,
        stream: false, // explicit for clarity; omitted by SDK internally
      };

      return await this.handleNonStreaming(params);
    }
  }

  /************************************  Helpers  ************************************/

  /**
   * Convert internal message structure → Responses API input items.
   *
   * Key differences from Chat Completions:
   * - Tool outputs must be sent as `{ type: "function_call_output", call_id, output }`
   *   instead of a `role: "tool"` chat message.
   * - We optionally omit prior assistant/user turns if chaining with `previous_response_id` for reasoning models
   *   (send only the new tail since the last assistant turn to reduce tokens).
   * - System/developer content can be passed via `instructions` (preferred) to keep caching stable.
   */
  private preprocessForResponses(
    msgs: PsModelMessage[],
    useTailForChainedReasoning: boolean
  ): { inputItems: any[]; instructions?: string } {
    const inputItems: any[] = [];

    // 1) Pull out any system/developer instructions
    //    If multiple system/developer messages exist, join with newlines (preserves behavior).
    const instructionParts: string[] = [];
    for (const m of msgs) {
      if (m.role === "system" || m.role === "developer") {
        if (m.message) instructionParts.push(m.message);
      }
    }
    const instructions =
      instructionParts.length > 0 ? instructionParts.join("\n\n") : undefined;

    // 2) Choose slice of messages to pass as `input`:
    //    If we're chaining with previous_response_id for reasoning models, send only the new tail
    //    (everything *after* the last assistant turn). Otherwise, send full history.
    let sliceStart = 0;
    if (useTailForChainedReasoning) {
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "assistant") {
          sliceStart = i + 1;
          break;
        }
      }
    }
    const sliced = msgs.slice(sliceStart);

    // 3) Map messages to Responses API input items
    for (const msg of sliced) {
      if (msg.role === "tool") {
        // Responses API expects function results using function_call_output items
        // Chat-completions semantics: msg.toolCallId is the tool_call_id we must map to call_id
        inputItems.push({
          type: "function_call_output",
          call_id: msg.toolCallId!,
          output: msg.message ?? "",
        });
        continue;
      }

      // Normal user/assistant content
      if (msg.role === "user" || msg.role === "assistant") {
        inputItems.push({
          role: msg.role,
          content: msg.message ?? "",
        });
        continue;
      }

      // Other roles (system/developer) are already captured in `instructions`,
      // but if callers previously mixed them into conversation, it's safe to ignore here.
    }

    // Ensure we always send *something* in input to satisfy API requirements
    if (inputItems.length === 0) {
      inputItems.push({ role: "user", content: "" });
    }

    return { inputItems, instructions };
  }

  private async handleStreaming(
    params: any,
    onChunk?: (c: string) => void
  ): Promise<PsBaseModelReturnParameters> {
    // For Responses API, streaming is via async iterator of events
    const stream = await this.client.responses.create(params);

    let content = "";
    let finalResponse: any | undefined;

    // Collect tool calls we’ll parse from the completed response (safer than piecemeal)
    for await (const event of stream as any) {
      const type: string | undefined = event?.type;

      // Text delta events may be named `response.output_text.delta` or `response.text.delta` depending on SDK version.
      if (type === "response.output_text.delta" || type === "response.text.delta") {
        const delta = event?.delta ?? event?.data ?? "";
        if (delta) {
          content += delta;
          onChunk?.(delta);
        }
        continue;
      }

      if (type === "response.completed") {
        finalResponse = event.response;
        // no break; continue to drain if any trailing events
        continue;
      }

      if (type === "response.error") {
        // Bubble up a descriptive error
        const msg = event.error?.message ?? "Streaming error from Responses API";
        throw new Error(msg);
      }
    }

    // Fallback: if stream didn't include a response.completed, try to coerce
    if (!finalResponse) {
      // Some SDKs expose a helper; here we rely on the iterator having yielded completed.
      // If not present, return whatever content we collected.
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

    // Persist response id for chained reasoning turns
    this.previousResponseId = finalResponse?.id ?? this.previousResponseId;

    const usage = finalResponse?.usage ?? {};
    const tokensIn: number =
      usage.input_tokens ??
      usage.prompt_tokens ??
      0;
    const tokensOut: number =
      usage.output_tokens ??
      usage.completion_tokens ??
      0;

    // Responses API typically exposes input_tokens_details.{cached_tokens}, output_tokens_details.{reasoning_tokens,audio_tokens}
    const cachedInTokens: number =
      usage.input_tokens_details?.cached_tokens ??
      usage.prompt_tokens_details?.cached_tokens ??
      0;

    const reasoningTokens: number =
      usage.output_tokens_details?.reasoning_tokens ??
      0;

    const audioTokens: number =
      usage.output_tokens_details?.audio_tokens ??
      0;

    const toolCalls = this.extractToolCallsFromResponse(finalResponse);

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

  private async handleNonStreaming(params: any): Promise<PsBaseModelReturnParameters> {
    const resp: any = await this.client.responses.create(params);

    // Persist response id for chained reasoning turns
    this.previousResponseId = resp?.id ?? this.previousResponseId;

    // Prefer convenience property; fall back to walking output items
    const content: string = (resp as any).output_text ?? this.extractTextFromResponse(resp) ?? "";

    const usage = resp?.usage ?? {};
    const tokensIn: number =
      usage.input_tokens ??
      usage.prompt_tokens ??
      0;
    const tokensOut: number =
      usage.output_tokens ??
      usage.completion_tokens ??
      0;
    const cachedInTokens: number =
      usage.input_tokens_details?.cached_tokens ??
      usage.prompt_tokens_details?.cached_tokens ??
      0;
    const reasoningTokens: number =
      usage.output_tokens_details?.reasoning_tokens ??
      0;
    const audioTokens: number =
      usage.output_tokens_details?.audio_tokens ??
      0;

    const toolCalls = this.extractToolCallsFromResponse(resp);

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

  /**
   * Extract assistant-visible text from a Responses API object by scanning output items.
   */
  private extractTextFromResponse(resp: any): string {
    try {
      const out = resp?.output;
      if (!Array.isArray(out)) return "";
      let buffer = "";
      for (const item of out) {
        if (item?.type === "message" && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c?.type === "output_text" || c?.type === "text") {
              if (typeof c?.text === "string") buffer += c.text;
            }
          }
        }
      }
      return buffer;
    } catch {
      return "";
    }
  }

  /**
   * Convert Responses API function call items → your ToolCall[] shape
   * (compatible with how your Chat Completions code handled tool_calls).
   */
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
          // Important mapping:
          // - Responses API exposes both `id` and `call_id` on function_call items.
          // - The "call_id" is the identifier you must echo back in a subsequent `function_call_output`.
          // - Your upstream code uses `tool_call_id`, so set ToolCall.id to `call_id`.
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