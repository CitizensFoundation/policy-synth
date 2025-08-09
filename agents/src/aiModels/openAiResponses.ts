import OpenAI from "openai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions";

import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { PsAiModelType } from "../aiModelTypes.js";

/**
 * Interface-compatible with OpenAiChat, but uses the Responses API.
 * - Flattens Chat Completions tool defs -> Responses tool defs
 * - Uses previous_response_id for reasoning models (with store: true)
 */
export class OpenAiResponses extends BaseChatModel {
  private client: OpenAI;
  private cfg: PsOpenAiModelConfig;
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

    // Negative logit-bias to discourage unallowed tools (same behavior as your original).
    const logitBias = this.buildLogitBias(tools, allowedTools);

    const { inputItems, instructions } = this.preprocessForResponses(
      messages,
      isReasoning && !!this.previousResponseId
    );

    const common: any = {
      model: this.cfg.modelName,
      input: inputItems.length ? inputItems : [{ role: "user", content: "" }],
      tools: responsesTools,
      tool_choice: responsesToolChoice,
      logit_bias: isReasoning ? undefined : logitBias,
      temperature: isReasoning ? undefined : this.cfg.temperature,
      max_output_tokens: this.cfg.maxTokensOut,
    };

    if (instructions) common.instructions = instructions;

    if (isReasoning) {
      if (this.cfg.reasoningEffort) {
        common.reasoning = { effort: this.cfg.reasoningEffort };
      }
      common.store = true;
      if (this.previousResponseId) {
        common.previous_response_id = this.previousResponseId;
      }
    }

    if (streaming) {
      const params = { ...common, stream: true };
      return await this.handleStreaming(params, streamingCallback);
    } else {
      const params = { ...common, stream: false };
      return await this.handleNonStreaming(params);
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
        const maybeStrict = typeof t.strict === "boolean" ? { strict: t.strict } : {};
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

  /**
   * Convert internal messages -> Responses API input items.
   * - system/developer -> instructions
   * - tool role -> { type:"function_call_output", call_id, output }
   * - if chaining reasoning, send only tail after the last assistant turn
   */
  private preprocessForResponses(
    msgs: PsModelMessage[],
    useTailForChainedReasoning: boolean
  ): { inputItems: any[]; instructions?: string } {
    const inputItems: any[] = [];

    const instructionParts: string[] = [];
    for (const m of msgs) {
      if (m.role === "system" || m.role === "developer") {
        if (m.message) instructionParts.push(m.message);
      }
    }
    const instructions =
      instructionParts.length ? instructionParts.join("\n\n") : undefined;

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

    for (const msg of sliced) {
      if (msg.role === "tool") {
        inputItems.push({
          type: "function_call_output",
          call_id: msg.toolCallId!,
          output: msg.message ?? "",
        });
        continue;
      }

      if (msg.role === "assistant" && msg.toolCall) {
        const { id, name, arguments: args } = msg.toolCall;
        inputItems.push({
          type: "function_call",
          name,
          call_id: id,
          // The Responses API expects a JSON string for arguments
          arguments: JSON.stringify(args ?? {}),
        });
        continue;
      }

      if (msg.role === "user" || msg.role === "assistant") {
        inputItems.push({ role: msg.role, content: msg.message ?? "" });
        continue;
      }
      // system/developer already captured in instructions
    }

    if (!inputItems.length) inputItems.push({ role: "user", content: "" });

    this.logger.info(`Input items: ${JSON.stringify(inputItems, null, 2)}`);
    this.logger.info(`Instructions: ${instructions?.slice(0, 100)}`);
    return { inputItems, instructions };
  }

  /** Negative logit-bias if allowedTools limits are provided. */
  private buildLogitBias(
    tools: ChatCompletionTool[],
    allowed: string[]
  ): Record<number, number> | undefined {
    if (!allowed.length || !tools.length) return undefined;

    try {
      const enc = encoding_for_model(this.cfg.modelName as TiktokenModel);
      const bias: Record<number, number> = {};
      for (const t of tools as any[]) {
        const name = t?.type === "function" ? t.function?.name : "";
        if (name && !allowed.includes(name)) {
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
        continue;
      }

      if (type === "response.error") {
        const msg = event.error?.message ?? "Streaming error from Responses API";
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

    const usage = finalResponse?.usage ?? {};
    const tokensIn: number = usage.input_tokens ?? usage.prompt_tokens ?? 0;
    const tokensOut: number = usage.output_tokens ?? usage.completion_tokens ?? 0;
    const cachedInTokens: number =
      usage.input_tokens_details?.cached_tokens ??
      usage.prompt_tokens_details?.cached_tokens ??
      0;
    const reasoningTokens: number =
      usage.output_tokens_details?.reasoning_tokens ?? 0;
    const audioTokens: number =
      usage.output_tokens_details?.audio_tokens ?? 0;

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
    this.logger.info(`Response: ${JSON.stringify(resp, null, 2)}`);

    this.previousResponseId = resp?.id ?? this.previousResponseId;

    const content: string =
      (resp as any).output_text ?? this.extractTextFromResponse(resp) ?? "";

    const usage = resp?.usage ?? {};
    const tokensIn: number = usage.input_tokens ?? usage.prompt_tokens ?? 0;
    const tokensOut: number = usage.output_tokens ?? usage.completion_tokens ?? 0;
    const cachedInTokens: number =
      usage.input_tokens_details?.cached_tokens ??
      usage.prompt_tokens_details?.cached_tokens ??
      0;
    const reasoningTokens: number =
      usage.output_tokens_details?.reasoning_tokens ?? 0;
    const audioTokens: number =
      usage.output_tokens_details?.audio_tokens ?? 0;

    const toolCalls = this.extractToolCallsFromResponse(resp);

    this.logger.info(`Tool calls: ${JSON.stringify(toolCalls, null, 2)}`);

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
