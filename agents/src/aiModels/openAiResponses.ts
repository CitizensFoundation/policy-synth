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
type ResponseAssistantMessage = {
  content: string;
  phase?: PsAssistantMessagePhase;
};

/**
 * Interface-compatible with OpenAiChat, but uses the Responses API.
 * - Flattens Chat Completions tool defs -> Responses tool defs
 * - Uses previous_response_id for reasoning models (with store: true)
 */
export class OpenAiResponses extends BaseChatModel {
 private client: OpenAI;
  private cfg: PsOpenAiModelConfig;
  private phaseAwareModelName: string;
  private previousResponseId?: string;
  private sentToolOutputIds = new Set<string>();
  private lastSubmittedMessageCount = 0;
  private lastNoInputContinuationSignature?: string;
  private usingAzure = false;

  constructor(config: PsOpenAiModelConfig) {
    const envAzureKey = process.env.AZURE_OPENAI_KEY;
    const envAzureEndpoint = process.env.AZURE_ENDPOINT;
    const envAzureDeployment = process.env.AZURE_DEPLOYMENT_NAME;
    const envAzureApiVersion = process.env.AZURE_OPENAI_API_VERSION;
    const useAzure =
      !!envAzureKey && !!envAzureEndpoint && !!envAzureDeployment;

    let {
      apiKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY!,
      modelName = "gpt-4o",
      maxTokensOut = 16_384,
    } = config;
    const configuredModelName =
      config.modelName ??
      process.env.PS_AI_MODEL_NAME ??
      envAzureDeployment ??
      modelName;

    if (useAzure) {
      apiKey = envAzureKey;
      modelName = envAzureDeployment;
    }

    super(config, modelName, maxTokensOut);

    if (!useAzure && process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY) {
      apiKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
      this.logger.warn(
        "Using PS_AGENT_OVERRIDE_OPENAI_API_KEY from environment variables"
      );
    }

    if (useAzure) {
      this.usingAzure = true;
      const baseURL = envAzureEndpoint;
      this.client = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders: { "api-key": apiKey }
      });
      this.logger.info(
        `Using Azure OpenAI endpoint ${baseURL} with deployment ${modelName}`
      );
    } else {
      this.client = new OpenAI({ apiKey });
    }

    this.cfg = { ...config, apiKey, modelName, maxTokensOut };
    this.phaseAwareModelName = configuredModelName;
  }

  private isPhaseAwareResponsesModel(): boolean {
    const modelName = this.phaseAwareModelName.toLowerCase();
    const match = modelName.match(/\bgpt-(\d+)(?:\.(\d+))?/);
    if (!match) return false;

    const major = Number.parseInt(match[1], 10);
    const minor = match[2] ? Number.parseInt(match[2], 10) : 0;

    if (!Number.isFinite(major) || !Number.isFinite(minor)) {
      return false;
    }

    if (major > 5) return true;
    if (major < 5) return false;
    return minor >= 3;
  }

  private resetResponsesState() {
    this.sentToolOutputIds.clear();
    this.lastSubmittedMessageCount = 0;
    this.lastNoInputContinuationSignature = undefined;
    this.previousResponseId = undefined;
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

    let hasPreviousResponse = !!this.previousResponseId;
    const hasTruncatedHistory =
      hasPreviousResponse && messages.length < this.lastSubmittedMessageCount;

    if (hasTruncatedHistory) {
      this.logger.debug(
        "Detected truncated message history; resetting Responses delta state."
      );
      this.resetResponsesState();
      hasPreviousResponse = false;
    }

    if (!hasPreviousResponse && this.lastSubmittedMessageCount > 0) {
      this.sentToolOutputIds.clear();
      this.lastSubmittedMessageCount = 0;
      this.lastNoInputContinuationSignature = undefined;
    }
    const { inputItems, instructions, pendingToolCallIds } =
      this.preprocessForResponses(
        messages,
        hasPreviousResponse,
        this.lastSubmittedMessageCount
      );

    const retryingSameMessages =
      hasPreviousResponse &&
      inputItems.length === 0 &&
      messages.length === this.lastSubmittedMessageCount;
    const noInputContinuationSignature =
      hasPreviousResponse && inputItems.length === 0
        ? `${this.previousResponseId}:${messages.length}:${this.lastSubmittedMessageCount}`
        : undefined;
    const retryingNoInputContinuation =
      !!noInputContinuationSignature &&
      noInputContinuationSignature === this.lastNoInputContinuationSignature;

    if (retryingSameMessages || retryingNoInputContinuation) {
      this.logger.debug(
        "No message delta detected with previous_response_id; resetting Responses state for a fresh retry."
      );
      this.resetResponsesState();
      return this.generate(
        messages,
        streaming,
        streamingCallback,
        media,
        tools,
        toolChoice,
        allowedTools
      );
    }

    this.lastNoInputContinuationSignature = noInputContinuationSignature;

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
      tools: responsesTools,
      tool_choice: responsesToolChoice,
      temperature: isReasoning ? undefined : this.cfg.temperature,
      max_output_tokens: this.cfg.maxTokensOut,
      safety_identifier: this.cfg.safetyIdentifier,
    };

    if (inputItems.length) {
      common.input = inputItems;
    } else if (this.previousResponseId) {
      this.logger.debug(
        "Continuing previous response without new input items."
      );
    } else {
      common.input = [{ role: "user", content: "" }];
    }

    if (instructions) common.instructions = instructions;

    if (isReasoning) {
      if (this.cfg.reasoningEffort) {
        const effort = this.cfg.reasoningEffort === 'max'
          ? 'xhigh'
          : this.cfg.reasoningEffort;
        common.reasoning = { effort };
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
    /*this.logger.debug(
      `Common model params: ${JSON.stringify(logParams, null, 2)}`
    );*/

    const params = { ...common, stream: streaming };
    let result: PsBaseModelReturnParameters;

    if (streaming) {
      result = await this.handleStreaming(params, streamingCallback);
    } else {
      result = await this.handleNonStreaming(params);
    }

    for (const id of pendingToolCallIds) {
      this.sentToolOutputIds.add(id);
    }

    if (!onlyToolOutputs) {
      this.lastSubmittedMessageCount = messages.length;
    }
    this.lastNoInputContinuationSignature = undefined;

    return result;
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
  ): { inputItems: any[]; instructions?: string; pendingToolCallIds: string[] } {
    const inputItems: any[] = [];
    const pendingToolCallIds: string[] = [];

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
          pendingToolCallIds.push(m.toolCallId);
        }
      }

      // If we found new tool outputs, return ONLY those (that’s what the API expects).
      if (inputItems.length > 0) {
        return { inputItems, instructions, pendingToolCallIds };
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

        inputItems.push(
          this.buildResponseMessageItem(msg.role, msg.message ?? "", msg.phase)
        );
      }

      return { inputItems, instructions, pendingToolCallIds };
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
          pendingToolCallIds.push(msg.toolCallId);
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
        inputItems.push(
          this.buildResponseMessageItem(msg.role, msg.message ?? "", msg.phase)
        );
      } else if (msg.role === "system" || msg.role === "developer") {
        continue;
      } else {
        this.logger.error(`Unexpected message role: ${msg.role}`);
      }
    }

    if (!inputItems.length) {
      this.logger.error("No input items found for openai responses");
    }

    return { inputItems, instructions, pendingToolCallIds };
  }

  private buildResponseMessageItem(
    role: string,
    content: string,
    phase?: PsAssistantMessagePhase
  ) {
    const item: { role: string; content: string; phase?: PsAssistantMessagePhase } = {
      role,
      content,
    };

    if (role === "assistant" && phase) {
      item.phase = phase;
    }

    return item;
  }

  private async handleStreaming(
    params: any,
    onChunk?: (c: string) => void
  ): Promise<PsBaseModelReturnParameters> {
    // Responses SSE: create({ stream: true }) returns an async iterator of events
    const stream = await this.client.responses.create(params);
    const phaseAwareStreaming = this.isPhaseAwareResponsesModel();

    let content = "";
    let finalResponse: any | undefined;
    const streamItemState = new Map<
      string,
      {
        allowOutput?: boolean;
        hasItemMetadata: boolean;
        pendingDeltas: string[];
      }
    >();

    const emitDelta = (delta: string) => {
      content += delta;
      onChunk?.(delta);
    };

    const getItemState = (itemId: string) => {
      let state = streamItemState.get(itemId);
      if (!state) {
        state = { hasItemMetadata: false, pendingDeltas: [] };
        streamItemState.set(itemId, state);
      }
      return state;
    };

    const resolveStreamItem = (
      item: any,
      allowUnphasedOutput = false
    ) => {
      if (item?.type !== "message" || !item?.id) return;

      const state = getItemState(item.id);
      state.hasItemMetadata = true;
      const phase =
        item?.phase === "commentary" || item?.phase === "final_answer"
          ? item.phase
          : undefined;

      if (phase) {
        state.allowOutput = phase !== "commentary";
      } else if (!phaseAwareStreaming || allowUnphasedOutput) {
        state.allowOutput = true;
      } else {
        return;
      }

      if (state.pendingDeltas.length > 0) {
        if (state.allowOutput) {
          for (const delta of state.pendingDeltas) {
            emitDelta(delta);
          }
        }
        state.pendingDeltas = [];
      }
    };

    const flushPendingStreamDeltas = () => {
      for (const state of streamItemState.values()) {
        if (state.pendingDeltas.length === 0) continue;

        if (state.allowOutput) {
          for (const delta of state.pendingDeltas) {
            emitDelta(delta);
          }
        }
        state.pendingDeltas = [];
      }
    };

    for await (const event of stream as any) {
      const type: string | undefined = event?.type;

      if (
        type === "response.output_item.added" ||
        type === "response.output_item.done"
      ) {
        resolveStreamItem(event?.item);
        continue;
      }

      // Text deltas (SDK emits either of these)
      if (
        type === "response.output_text.delta" ||
        type === "response.text.delta" ||
        type === "response.refusal.delta"
      ) {
        const delta =
          type === "response.refusal.delta"
            ? event?.delta ?? ""
            : event?.delta ?? event?.data ?? "";
        if (delta) {
          const itemId = event?.item_id;
          if (!itemId) {
            emitDelta(delta);
          } else {
            const stateForItem = getItemState(itemId);
            if (!stateForItem.hasItemMetadata) {
              stateForItem.pendingDeltas.push(delta);
              continue;
            }
            if (stateForItem.allowOutput === false) {
              continue;
            }
            if (stateForItem.allowOutput) {
              emitDelta(delta);
            } else {
              stateForItem.pendingDeltas.push(delta);
            }
          }
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

    if (finalResponse?.output && Array.isArray(finalResponse.output)) {
      for (const item of finalResponse.output) {
        resolveStreamItem(item, true);
      }
    }

    if (!finalResponse) {
      flushPendingStreamDeltas();
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

    const assistantMessages = this.extractAssistantMessages(finalResponse);
    const orderedOutputItems = this.extractOrderedOutputItems(finalResponse);
    const { content: responseContent, phase } =
      this.selectAssistantReply(finalResponse);
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
          content: responseContent || content,
          phase,
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
      content: responseContent || content,
      tokensIn,
      tokensOut,
      cachedInTokens,
      reasoningTokens,
      audioTokens,
      phase,
      assistantMessages,
      orderedOutputItems,
      toolCalls,
    };
  }

  private async handleNonStreaming(
    params: any
  ): Promise<PsBaseModelReturnParameters> {
    const resp: any = await this.client.responses.create(params);
    //this.logger.debug(`Response: ${JSON.stringify(resp, null, 2)}`);

    this.previousResponseId = resp?.id ?? this.previousResponseId;

    this.logger.debug(`previousResponseId: ${this.previousResponseId}`);

    const assistantMessages = this.extractAssistantMessages(resp);
    const orderedOutputItems = this.extractOrderedOutputItems(resp);
    const { content, phase } = this.selectAssistantReply(resp);

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
          phase,
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
      phase,
      assistantMessages,
      orderedOutputItems,
      toolCalls,
    };
  }

  private extractTextFromResponse(resp: any): string {
    const assistantMessages = this.extractAssistantMessages(resp);
    if (assistantMessages.length > 0) {
      return this.joinAssistantMessageContent(assistantMessages);
    }

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

  private extractAssistantMessages(resp: any): ResponseAssistantMessage[] {
    const messages: ResponseAssistantMessage[] = [];

    try {
      const out = resp?.output;
      if (!Array.isArray(out)) return messages;

      for (const item of out) {
        if (item?.type !== "message") continue;

        const content = this.extractTextFromMessageItem(item);
        const phase =
          item?.phase === "commentary" || item?.phase === "final_answer"
            ? item.phase
            : undefined;

        if (!content && !phase) continue;

        messages.push({ content, phase });
      }
    } catch {
      return [];
    }

    return messages;
  }

  private extractTextFromMessageItem(item: any): string {
    if (!Array.isArray(item?.content)) return "";

    let buffer = "";
    for (const part of item.content) {
      if (
        part?.type === "output_text" ||
        part?.type === "text" ||
        typeof part?.text === "string"
      ) {
        buffer += part.text ?? "";
      } else if (
        part?.type === "refusal" ||
        typeof part?.refusal === "string"
      ) {
        buffer += part.refusal ?? "";
      }
    }

    return buffer;
  }

  private joinAssistantMessageContent(messages: ResponseAssistantMessage[]): string {
    return messages.map((message) => message.content).join("");
  }

  private extractOrderedOutputItems(resp: any): PsResponseOutputItem[] {
    const orderedOutputItems: PsResponseOutputItem[] = [];

    try {
      const out = resp?.output;
      if (!Array.isArray(out)) return orderedOutputItems;

      for (const item of out) {
        if (item?.type === "message") {
          const message = {
            content: this.extractTextFromMessageItem(item),
            phase:
              item?.phase === "commentary" || item?.phase === "final_answer"
                ? item.phase
                : undefined,
          } satisfies PsAssistantResponseMessage;

          if (!message.content && !message.phase) {
            continue;
          }

          orderedOutputItems.push({
            type: "assistant_message",
            message,
          });
          continue;
        }

        if (item?.type === "function_call") {
          const rawArgs = item?.arguments ?? "";
          let parsed: Record<string, unknown> = {};
          try {
            parsed = rawArgs ? JSON.parse(rawArgs) : {};
          } catch {
            parsed = {};
          }

          orderedOutputItems.push({
            type: "tool_call",
            toolCall: {
              id: item?.call_id ?? item?.id ?? "",
              name: item?.name ?? "",
              arguments: parsed,
            },
          });
        }
      }
    } catch {
      return [];
    }

    return orderedOutputItems;
  }

  private selectAssistantReply(resp: any): ResponseAssistantMessage {
    const assistantMessages = this.extractAssistantMessages(resp);
    if (assistantMessages.length > 0) {
      const finalAnswerMessages = assistantMessages.filter(
        (message) =>
          message.phase === "final_answer" && message.content.length > 0
      );
      if (finalAnswerMessages.length > 0) {
        return {
          content: this.joinAssistantMessageContent(finalAnswerMessages),
          phase: "final_answer",
        };
      }

      const unphasedMessages = assistantMessages.filter(
        (message) => !message.phase && message.content.length > 0
      );
      if (unphasedMessages.length > 0) {
        return {
          content: this.joinAssistantMessageContent(unphasedMessages),
        };
      }

      const commentaryMessages = assistantMessages.filter(
        (message) =>
          message.phase === "commentary" && message.content.length > 0
      );
      if (commentaryMessages.length > 0) {
        return {
          content: this.joinAssistantMessageContent(commentaryMessages),
          phase: "commentary",
        };
      }

      return {
        content: this.joinAssistantMessageContent(assistantMessages),
        phase: assistantMessages.at(-1)?.phase,
      };
    }

    return {
      content: (resp as any).output_text ?? this.extractTextFromResponse(resp) ?? "",
    };
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
