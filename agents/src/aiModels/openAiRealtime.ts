import OpenAI from "openai";
import { randomUUID } from "node:crypto";
import { OpenAIRealtimeWebSocket } from "openai/realtime/websocket";
import type {
  AudioTranscription,
  ConversationItemCreateEvent,
  InputAudioBufferAppendEvent,
  InputAudioBufferCommitEvent,
  RealtimeAudioFormats,
  RealtimeAudioConfig,
  RealtimeAudioInputTurnDetection,
  RealtimeClientEvent,
  RealtimeErrorEvent,
  RealtimeFunctionTool,
  RealtimeResponseCreateParams,
  RealtimeResponseUsage,
  RealtimeServerEvent,
  RealtimeSessionCreateRequest,
  RealtimeToolChoiceConfig,
  ResponseCancelEvent,
  ResponseCreateEvent,
  ResponseFunctionCallArgumentsDoneEvent,
  SessionUpdateEvent,
} from "openai/resources/realtime/realtime";
import { BaseRealtimeModel } from "./baseRealtimeModel.js";
import type {
  PsRealtimeAudioFormat,
  PsRealtimeCreateResponseOptions,
  PsRealtimeFunctionOutputOptions,
  PsRealtimeInputAudioTranscription,
  PsRealtimeReasoningEffort,
  PsRealtimeSendTextOptions,
  PsRealtimeSession,
  PsRealtimeSessionEvent,
  PsRealtimeSessionEventHandler,
  PsRealtimeSessionOptions,
  PsRealtimeToolChoice,
  PsRealtimeTurnDetection,
  PsRealtimeUsage,
} from "./baseRealtimeModel.js";
import type { PsAssistantTool } from "../base/assistantTools.js";

export interface OpenAiRealtimeSocketLike {
  ready?(): Promise<void>;
  send(event: RealtimeClientEvent): void;
  close(props?: { code: number; reason: string }): void;
  on(
    eventName: "event",
    listener: (event: RealtimeServerEvent) => void
  ): unknown;
  on(eventName: "error", listener: (error: unknown) => void): unknown;
  addCloseListener?(listener: (event?: unknown) => void): void;
  removeCloseListener?(listener: (event?: unknown) => void): void;
}

export interface OpenAiRealtimeSocketFactoryParams {
  apiKey: string;
  model: string;
  baseURL?: string;
  regionalProcessing?: PsOpenAiRegionalProcessing;
}

export type OpenAiRealtimeSocketFactory = (
  params: OpenAiRealtimeSocketFactoryParams
) => Promise<OpenAiRealtimeSocketLike>;

interface CloseEventLike {
  code?: number;
  reason?: string;
}

interface EventTargetLike {
  readyState?: number;
  addEventListener(
    eventName: "open" | "close" | "error",
    listener: (event?: CloseEventLike) => void
  ): void;
  removeEventListener?(
    eventName: "open" | "close" | "error",
    listener: (event?: CloseEventLike) => void
  ): void;
}

export class OpenAiSdkRealtimeSocketAdapter implements OpenAiRealtimeSocketLike {
  private readonly closeTarget?: EventTargetLike;
  private readonly readyPromise: Promise<void>;

  constructor(private readonly socket: OpenAIRealtimeWebSocket) {
    this.closeTarget = this.extractCloseTarget(socket);
    this.readyPromise = this.buildReadyPromise();
  }

  ready(): Promise<void> {
    return this.readyPromise;
  }

  send(event: RealtimeClientEvent): void {
    this.socket.send(event);
  }

  close(props?: { code: number; reason: string }): void {
    this.socket.close(props);
  }

  on(
    eventName: "event",
    listener: (event: RealtimeServerEvent) => void
  ): unknown;
  on(eventName: "error", listener: (error: unknown) => void): unknown;
  on(
    eventName: "event" | "error",
    listener: ((event: RealtimeServerEvent) => void) | ((error: unknown) => void)
  ): unknown {
    if (eventName === "event") {
      return this.socket.on("event", listener as (event: RealtimeServerEvent) => void);
    }

    return this.socket.on("error", (error) =>
      (listener as (error: unknown) => void)(error)
    );
  }

  addCloseListener(listener: (event?: unknown) => void): void {
    this.closeTarget?.addEventListener("close", listener);
  }

  removeCloseListener(listener: (event?: unknown) => void): void {
    this.closeTarget?.removeEventListener?.("close", listener);
  }

  private extractCloseTarget(
    socket: OpenAIRealtimeWebSocket
  ): EventTargetLike | undefined {
    const rawSocket = socket.socket as unknown;
    if (
      rawSocket &&
      typeof rawSocket === "object" &&
      "addEventListener" in rawSocket &&
      typeof rawSocket.addEventListener === "function"
    ) {
      return rawSocket as EventTargetLike;
    }

    return undefined;
  }

  private buildReadyPromise(): Promise<void> {
    const target = this.closeTarget;
    if (!target || target.readyState === undefined || target.readyState === 1) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        target.removeEventListener?.("open", handleOpen);
        target.removeEventListener?.("error", handleError);
        target.removeEventListener?.("close", handleClose);
      };
      const handleOpen = () => {
        cleanup();
        resolve();
      };
      const handleError = (event?: CloseEventLike) => {
        cleanup();
        reject(
          new Error(
            `Realtime WebSocket failed to open${
              event?.reason ? `: ${event.reason}` : ""
            }`
          )
        );
      };
      const handleClose = (event?: CloseEventLike) => {
        cleanup();
        reject(
          new Error(
            `Realtime WebSocket closed before opening${
              event?.reason ? `: ${event.reason}` : ""
            }`
          )
        );
      };

      target.addEventListener("open", handleOpen);
      target.addEventListener("error", handleError);
      target.addEventListener("close", handleClose);
    });
  }
}

export const defaultOpenAiRealtimeSocketFactory: OpenAiRealtimeSocketFactory =
  async ({ apiKey, model, baseURL }) => {
    const client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    const socket = new OpenAIRealtimeWebSocket({ model }, client);
    return new OpenAiSdkRealtimeSocketAdapter(socket);
  };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getStringProperty(
  value: unknown,
  key: string
): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const property = value[key];
  return typeof property === "string" ? property : undefined;
}

function getNumberProperty(
  value: unknown,
  key: string
): number | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const property = value[key];
  return typeof property === "number" ? property : undefined;
}

function isRealtimeApiSdkError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  if (typeof error.event_id === "string") {
    return true;
  }

  const apiError = error.error;
  return (
    isRecord(apiError) &&
    typeof apiError.message === "string" &&
    typeof apiError.type === "string"
  );
}

export class OpenAiRealtimeSession implements PsRealtimeSession {
  private socket?: OpenAiRealtimeSocketLike;
  private listeners = new Set<PsRealtimeSessionEventHandler>();
  private connected = false;
  private closed = false;
  private connectPromise?: Promise<void>;
  private connectionEpoch = 0;
  private sessionId?: string;
  private closeListener?: (event?: unknown) => void;
  private currentOptions: PsRealtimeSessionOptions;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    initialOptions: PsRealtimeSessionOptions = {},
    private readonly socketFactory: OpenAiRealtimeSocketFactory =
      defaultOpenAiRealtimeSocketFactory,
    private readonly socketOptions: Pick<
      OpenAiRealtimeSocketFactoryParams,
      "baseURL" | "regionalProcessing"
    > = {}
  ) {
    this.currentOptions = { ...initialOptions };
  }

  get id(): string | undefined {
    return this.sessionId;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }

    this.closed = false;
    const connectionEpoch = ++this.connectionEpoch;
    const connectPromise = this.openConnection(connectionEpoch);
    this.connectPromise = connectPromise;
    try {
      await connectPromise;
    } finally {
      if (this.connectPromise === connectPromise) {
        this.connectPromise = undefined;
      }
    }
  }

  private async openConnection(connectionEpoch: number): Promise<void> {
    const socket = await this.socketFactory({
      apiKey: this.apiKey,
      model: this.currentOptions.model ?? this.model,
      ...this.socketOptions,
    });

    if (connectionEpoch !== this.connectionEpoch || this.closed) {
      this.closeOpeningSocket(
        socket,
        "PolicySynth realtime session opening cancelled"
      );
      throw new Error("Realtime session connection was closed before ready");
    }

    this.socket = socket;
    socket.on("event", (event) => void this.handleServerEvent(event));
    socket.on("error", (error) => {
      if (isRealtimeApiSdkError(error)) {
        return;
      }

      void this.emit({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
        rawEvent: error,
      });
    });

    const closeListener = (event?: unknown) => {
      if (this.closed || this.socket !== socket) {
        return;
      }

      this.closed = true;
      this.connected = false;
      this.connectionEpoch += 1;
      socket.removeCloseListener?.(closeListener);
      this.closeListener = undefined;
      this.socket = undefined;
      void this.emit({
        type: "closed",
        code: getNumberProperty(event, "code"),
        reason: getStringProperty(event, "reason"),
        rawEvent: event,
      });
    };
    this.closeListener = closeListener;
    socket.addCloseListener?.(closeListener);
    try {
      await socket.ready?.();
    } catch (error) {
      if (
        this.socket === socket &&
        this.closeListener === closeListener &&
        connectionEpoch === this.connectionEpoch
      ) {
        socket.removeCloseListener?.(closeListener);
        this.closeListener = undefined;
        this.socket = undefined;
        this.connected = false;
        this.closed = true;
      }
      try {
        socket.close({
          code: 1000,
          reason: "PolicySynth realtime session opening failed",
        });
      } catch {
        // Preserve the original connection failure.
      }
      throw error;
    }

    if (
      this.socket !== socket ||
      this.closed ||
      connectionEpoch !== this.connectionEpoch
    ) {
      if (this.socket === socket && this.closeListener === closeListener) {
        socket.removeCloseListener?.(closeListener);
        this.closeListener = undefined;
        this.socket = undefined;
        this.connected = false;
        this.closed = true;
      }
      this.closeOpeningSocket(
        socket,
        "PolicySynth realtime session opening cancelled"
      );
      throw new Error("Realtime session connection was closed before ready");
    }

    this.connected = true;

    if (this.hasSessionConfiguration(this.currentOptions)) {
      this.sendSessionUpdate(this.currentOptions, true);
    }
  }

  async update(options: PsRealtimeSessionOptions): Promise<void> {
    this.currentOptions = {
      ...this.currentOptions,
      ...options,
    };

    this.sendSessionUpdate(options, false);
  }

  private sendSessionUpdate(
    options: PsRealtimeSessionOptions,
    includeImmutableFields: boolean
  ): void {
    const session = this.buildSessionConfig(options, includeImmutableFields);
    if (!this.hasMutableSessionConfiguration(session)) {
      return;
    }

    const event: SessionUpdateEvent = {
      type: "session.update",
      event_id: this.createEventId("session_update"),
      session,
    };
    this.send(event);
  }

  async sendText(
    text: string,
    options: PsRealtimeSendTextOptions = {}
  ): Promise<void> {
    const itemEvent: ConversationItemCreateEvent = {
      type: "conversation.item.create",
      event_id: this.createEventId("text"),
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    };
    this.send(itemEvent);

    if (options.createResponse !== false) {
      await this.createResponse(options.response);
    }
  }

  async appendAudio(audio: Uint8Array | string): Promise<void> {
    const encodedAudio =
      typeof audio === "string" ? audio : Buffer.from(audio).toString("base64");
    const event: InputAudioBufferAppendEvent = {
      type: "input_audio_buffer.append",
      event_id: this.createEventId("audio_append"),
      audio: encodedAudio,
    };
    this.send(event);
  }

  async commitAudio(): Promise<void> {
    const event: InputAudioBufferCommitEvent = {
      type: "input_audio_buffer.commit",
      event_id: this.createEventId("audio_commit"),
    };
    this.send(event);
  }

  async cancelResponse(responseId?: string): Promise<void> {
    const event: ResponseCancelEvent = {
      type: "response.cancel",
      event_id: this.createEventId("response_cancel"),
      response_id: responseId,
    };
    this.send(event);
  }

  async createResponse(
    options: PsRealtimeCreateResponseOptions = {}
  ): Promise<void> {
    const response = this.buildResponseConfig(options);
    const event: ResponseCreateEvent = {
      type: "response.create",
      event_id: this.createEventId("response_create"),
      response,
    };
    this.send(event);
  }

  async sendFunctionOutput(
    callId: string,
    output: string,
    options: PsRealtimeFunctionOutputOptions = {}
  ): Promise<void> {
    const event: ConversationItemCreateEvent = {
      type: "conversation.item.create",
      event_id: this.createEventId("function_output"),
      item: {
        type: "function_call_output",
        call_id: callId,
        output,
      },
    };
    this.send(event);

    if (options.createResponse) {
      await this.createResponse(options.response);
    }
  }

  async close(): Promise<void> {
    const socket = this.socket;
    const hadPendingConnect = this.connectPromise !== undefined;

    if (!socket) {
      if (hadPendingConnect && !this.closed) {
        this.connectionEpoch += 1;
        this.closed = true;
        this.connected = false;
        this.connectPromise = undefined;
        await this.emit({ type: "closed", code: 1000, reason: "closed" });
      }
      return;
    }

    if (this.closed) {
      return;
    }

    this.connectionEpoch += 1;
    this.closed = true;
    if (this.closeListener) {
      socket.removeCloseListener?.(this.closeListener);
      this.closeListener = undefined;
    }

    this.socket = undefined;
    this.connectPromise = undefined;
    socket.close({ code: 1000, reason: "PolicySynth realtime session closed" });
    this.connected = false;
    await this.emit({ type: "closed", code: 1000, reason: "closed" });
  }

  private closeOpeningSocket(
    socket: OpenAiRealtimeSocketLike,
    reason: string
  ): void {
    try {
      socket.close({ code: 1000, reason });
    } catch {
      // The caller should preserve the original startup/cancellation error.
    }
  }

  onEvent(listener: PsRealtimeSessionEventHandler): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private send(event: RealtimeClientEvent): void {
    if (!this.socket || !this.connected) {
      throw new Error("Realtime session is not connected");
    }

    this.socket.send(event);
  }

  private async emit(event: PsRealtimeSessionEvent): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener(event);
      } catch (error) {
        await this.emitListenerError(error, event);
      }
    }
  }

  private async emitListenerError(
    error: unknown,
    sourceEvent: PsRealtimeSessionEvent
  ): Promise<void> {
    if (sourceEvent.type === "error") {
      return;
    }

    const errorEvent: PsRealtimeSessionEvent = {
      type: "error",
      message: this.formatListenerError(error),
      code: "listener_error",
      rawEvent: { error, sourceEvent },
    };

    for (const listener of this.listeners) {
      try {
        await listener(errorEvent);
      } catch {
        // Listener error reporting must not create another unhandled rejection.
      }
    }
  }

  private formatListenerError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return `Realtime event listener failed: ${message}`;
  }

  private async handleServerEvent(event: RealtimeServerEvent): Promise<void> {
    switch (event.type) {
      case "session.created":
        this.sessionId = this.extractSessionId(event);
        await this.emit({
          type: "session.created",
          sessionId: this.sessionId,
          rawEvent: event,
        });
        break;
      case "session.updated":
        this.sessionId = this.extractSessionId(event) ?? this.sessionId;
        await this.emit({
          type: "session.updated",
          sessionId: this.sessionId,
          rawEvent: event,
        });
        break;
      case "response.output_audio.delta":
        await this.emit({
          type: "audio.delta",
          delta: event.delta,
          responseId: event.response_id,
          itemId: event.item_id,
          rawEvent: event,
        });
        break;
      case "response.output_text.delta":
        await this.emit({
          type: "text.delta",
          delta: event.delta,
          responseId: event.response_id,
          itemId: event.item_id,
          rawEvent: event,
        });
        break;
      case "conversation.item.input_audio_transcription.completed":
        await this.emit({
          type: "input.transcript.done",
          transcript: event.transcript,
          itemId: event.item_id,
          rawEvent: event,
        });
        break;
      case "response.output_audio_transcript.done":
        await this.emit({
          type: "assistant.transcript.done",
          transcript: event.transcript,
          responseId: event.response_id,
          itemId: event.item_id,
          rawEvent: event,
        });
        break;
      case "response.created":
        await this.emit({
          type: "response.created",
          responseId: event.response.id,
          metadata: event.response.metadata,
          rawEvent: event,
        });
        break;
      case "response.done":
        await this.emit({
          type: "response.done",
          responseId: event.response.id,
          status: event.response.status,
          usage: this.mapUsage(event.response.usage),
          rawEvent: event,
        });
        break;
      case "response.function_call_arguments.done":
        await this.emit(this.mapFunctionCallEvent(event));
        break;
      case "error":
        await this.emit(this.mapErrorEvent(event));
        break;
      default:
        break;
    }
  }

  private mapFunctionCallEvent(
    event: ResponseFunctionCallArgumentsDoneEvent
  ): PsRealtimeSessionEvent {
    return {
      type: "tool.call",
      call: {
        id: event.item_id,
        callId: event.call_id,
        name: event.name,
        arguments: event.arguments,
      },
      responseId: event.response_id,
      rawEvent: event,
    };
  }

  private mapErrorEvent(event: RealtimeErrorEvent): PsRealtimeSessionEvent {
    return {
      type: "error",
      message: event.error.message,
      code: event.error.code,
      rawEvent: event,
    };
  }

  private extractSessionId(event: unknown): string | undefined {
    if (!isRecord(event)) {
      return undefined;
    }

    const session = event.session;
    return getStringProperty(session, "id");
  }

  private mapUsage(usage?: RealtimeResponseUsage): PsRealtimeUsage | undefined {
    if (!usage) {
      return undefined;
    }

    return {
      tokensIn: usage.input_tokens,
      tokensOut: usage.output_tokens,
      totalTokens: usage.total_tokens,
      cachedInTokens: usage.input_token_details?.cached_tokens,
      audioInputTokens: usage.input_token_details?.audio_tokens,
      audioOutputTokens: usage.output_token_details?.audio_tokens,
      textInputTokens: usage.input_token_details?.text_tokens,
      textOutputTokens: usage.output_token_details?.text_tokens,
      imageInputTokens: usage.input_token_details?.image_tokens,
    };
  }

  private buildSessionConfig(
    options: PsRealtimeSessionOptions,
    includeImmutableFields = true
  ): RealtimeSessionCreateRequest {
    return {
      type: "realtime",
      model: undefined,
      instructions: options.instructions,
      output_modalities: options.outputModalities,
      max_output_tokens: options.maxOutputTokens,
      parallel_tool_calls: options.parallelToolCalls,
      reasoning: options.reasoningEffort
        ? { effort: this.mapReasoningEffort(options.reasoningEffort) }
        : undefined,
      tool_choice: this.mapToolChoice(options.toolChoice),
      tools: this.mapTools(options.tools),
      tracing: includeImmutableFields ? options.tracing : undefined,
      audio: this.buildAudioConfig(options, includeImmutableFields),
    };
  }

  private buildResponseConfig(
    options: PsRealtimeCreateResponseOptions
  ): RealtimeResponseCreateParams {
    return {
      instructions: options.instructions,
      output_modalities: options.outputModalities,
      max_output_tokens: options.maxOutputTokens,
      parallel_tool_calls: options.parallelToolCalls,
      reasoning: options.reasoningEffort
        ? { effort: this.mapReasoningEffort(options.reasoningEffort) }
        : undefined,
      tool_choice: this.mapToolChoice(options.toolChoice),
      tools: this.mapTools(options.tools),
      metadata: options.metadata,
    };
  }

  private buildAudioConfig(
    options: PsRealtimeSessionOptions,
    includeVoice = true
  ): RealtimeAudioConfig | undefined {
    const inputFormat = this.mapAudioFormat(options.inputAudioFormat);
    const outputFormat = this.mapAudioFormat(options.outputAudioFormat);
    const voice = includeVoice ? options.voice : undefined;
    const input =
      inputFormat ||
      options.inputAudioTranscription !== undefined ||
      options.turnDetection !== undefined
        ? ({
            format: inputFormat,
            transcription: this.mapAudioTranscription(
              options.inputAudioTranscription
            ),
            turn_detection: this.mapTurnDetection(options.turnDetection),
          } as RealtimeAudioConfig["input"] & {
            transcription?: AudioTranscription | null;
          })
        : undefined;
    const output =
      outputFormat || voice
        ? {
            format: outputFormat,
            voice,
          }
        : undefined;

    return input || output ? { input, output } : undefined;
  }

  private mapAudioFormat(
    format?: PsRealtimeAudioFormat
  ): RealtimeAudioFormats | undefined {
    switch (format) {
      case "pcm16":
        return { type: "audio/pcm", rate: 24000 };
      case "g711_ulaw":
        return { type: "audio/pcmu" };
      case "g711_alaw":
        return { type: "audio/pcma" };
      default:
        return undefined;
    }
  }

  private mapAudioTranscription(
    transcription?: PsRealtimeInputAudioTranscription | null
  ): AudioTranscription | null | undefined {
    if (transcription === null) {
      return null;
    }

    if (!transcription) {
      return undefined;
    }

    return {
      model: transcription.model,
      language: transcription.language,
      prompt: transcription.prompt,
      delay: transcription.delay,
    };
  }

  private mapTurnDetection(
    turnDetection?: PsRealtimeTurnDetection
  ): RealtimeAudioInputTurnDetection | null | undefined {
    if (turnDetection === null) {
      return null;
    }

    if (!turnDetection) {
      return undefined;
    }

    if (turnDetection.type === "server_vad") {
      return {
        type: "server_vad",
        threshold: turnDetection.threshold,
        prefix_padding_ms: turnDetection.prefixPaddingMs,
        silence_duration_ms: turnDetection.silenceDurationMs,
        create_response: turnDetection.createResponse,
        interrupt_response: turnDetection.interruptResponse,
        idle_timeout_ms: turnDetection.idleTimeoutMs,
      };
    }

    return {
      type: "semantic_vad",
      eagerness: turnDetection.eagerness,
      create_response: turnDetection.createResponse,
      interrupt_response: turnDetection.interruptResponse,
    };
  }

  private mapTools(
    tools?: PsAssistantTool[]
  ): RealtimeFunctionTool[] | undefined {
    if (tools === undefined) {
      return undefined;
    }

    return tools.map((tool) => ({
      type: "function",
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  }

  private mapToolChoice(
    toolChoice?: PsRealtimeToolChoice
  ): RealtimeToolChoiceConfig | undefined {
    return toolChoice;
  }

  private mapReasoningEffort(
    effort: PsRealtimeReasoningEffort
  ): "minimal" | "low" | "medium" | "high" | "xhigh" {
    return effort;
  }

  private hasSessionConfiguration(options: PsRealtimeSessionOptions): boolean {
    return Object.keys(options).some((key) => key !== "model");
  }

  private hasMutableSessionConfiguration(
    session: RealtimeSessionCreateRequest
  ): boolean {
    return Object.entries(session).some(
      ([key, value]) => key !== "type" && value !== undefined
    );
  }

  private createEventId(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }
}

export class OpenAiRealtime extends BaseRealtimeModel {
  private readonly transportBaseUrl?: string;

  constructor(
    config: PsAiModelConfig,
    private readonly socketFactory: OpenAiRealtimeSocketFactory =
      defaultOpenAiRealtimeSocketFactory
  ) {
    const apiKey =
      process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY ?? config.apiKey;
    const enforceEuRegion = process.env.OPENAI_ENFORCE_EU_REGION === "true";
    const effectiveRegionalProcessing =
      config.regionalProcessing === "eu" || enforceEuRegion ? "eu" : undefined;
    const effectiveConfig: PsAiModelConfig = {
      ...config,
      apiKey,
      regionalProcessing: effectiveRegionalProcessing,
    };

    super(effectiveConfig, effectiveConfig.modelName || "gpt-realtime-2");
    this.transportBaseUrl =
      effectiveRegionalProcessing === "eu"
        ? "https://eu.api.openai.com/v1"
        : undefined;

    if (process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY) {
      this.logger.warn(
        "Using PS_AGENT_OVERRIDE_OPENAI_API_KEY from environment variables"
      );
    }
    if (enforceEuRegion) {
      this.logger.info(
        "OPENAI_ENFORCE_EU_REGION is enabled; forcing OpenAI regional processing to eu"
      );
    }
    if (this.transportBaseUrl) {
      this.logger.info(
        `Using OpenAI regional processing endpoint ${this.transportBaseUrl}`
      );
    }
  }

  async createSession(
    options: PsRealtimeSessionOptions = {}
  ): Promise<PsRealtimeSession> {
    const sessionOptions: PsRealtimeSessionOptions = {
      ...options,
      maxOutputTokens: options.maxOutputTokens ?? this.config.maxTokensOut,
    };

    return new OpenAiRealtimeSession(
      this.config.apiKey,
      String(sessionOptions.model ?? this.getApiModelName() ?? "gpt-realtime-2"),
      sessionOptions,
      this.socketFactory,
      {
        baseURL: this.transportBaseUrl,
        regionalProcessing: this.config.regionalProcessing,
      }
    );
  }
}

export default OpenAiRealtime;
