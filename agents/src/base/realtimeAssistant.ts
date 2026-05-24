import { PolicySynthAgentBase } from "./agentBase.js";
import {
  executeAssistantToolCall,
  type PsAssistantTool,
  type PsAssistantToolExecutionOutput,
  type PsAssistantToolResult,
} from "./assistantTools.js";
import type {
  BaseRealtimeModel,
  PsRealtimeCreateResponseOptions,
  PsRealtimeSession,
  PsRealtimeSessionEvent,
  PsRealtimeSessionOptions,
} from "../aiModels/baseRealtimeModel.js";

type MaybePromise<T> = T | Promise<T>;

interface PendingRealtimeToolResponse {
  responseId: string;
  session: PsRealtimeSession;
  pendingToolCalls: number;
  responseDone: boolean;
  responseCreated: boolean;
  responseOptions?: PsRealtimeCreateResponseOptions;
  failed: boolean;
}

interface PendingTrackedRealtimeResponseOptions {
  session: PsRealtimeSession;
  options: PsRealtimeCreateResponseOptions;
}

const REALTIME_RESPONSE_OPTIONS_METADATA_KEY = "ps_response_options_id";

export abstract class PolicySynthRealtimeAssistantBase extends PolicySynthAgentBase {
  protected realtimeSession?: PsRealtimeSession;
  protected realtimeVoiceEnabled = false;
  private removeRealtimeListener?: () => void;
  private realtimeStartup?: {
    epoch: number;
    promise: Promise<PsRealtimeSession>;
    session?: PsRealtimeSession;
    removeListener?: () => void;
  };
  private realtimeSessionEpoch = 0;
  private readonly pendingRealtimeToolResponses = new Map<
    PsRealtimeSession,
    Map<string, PendingRealtimeToolResponse>
  >();
  private realtimeResponseOptionsSequence = 0;
  private readonly pendingRealtimeResponseOptionsByTrackingId = new Map<
    string,
    PendingTrackedRealtimeResponseOptions
  >();
  private readonly queuedRealtimeResponseOptions = new Map<
    PsRealtimeSession,
    PsRealtimeCreateResponseOptions[]
  >();
  private readonly realtimeResponseOptionsByResponseId = new Map<
    PsRealtimeSession,
    Map<string, PsRealtimeCreateResponseOptions>
  >();

  constructor(
    protected readonly realtimeModel: BaseRealtimeModel,
    protected readonly realtimeDefaults: PsRealtimeSessionOptions = {}
  ) {
    super();
  }

  protected abstract getRealtimeSystemPrompt(): MaybePromise<string>;

  protected abstract getRealtimeTools(): MaybePromise<PsAssistantTool[]>;

  protected getRealtimeAllowedTools(
    tools: PsAssistantTool[]
  ): MaybePromise<string[]> {
    return tools.map((tool) => tool.name);
  }

  protected getRealtimeSessionMetadata(): MaybePromise<
    Record<string, unknown> | undefined
  > {
    return undefined;
  }

  protected async onRealtimeTextDelta(_text: string): Promise<void> {}

  protected async onRealtimeAudioDelta(_base64Audio: string): Promise<void> {}

  protected async onRealtimeUserTranscript(_text: string): Promise<void> {}

  protected async onRealtimeAssistantTranscript(_text: string): Promise<void> {}

  protected async onRealtimeToolResult(
    _result: PsAssistantToolExecutionOutput
  ): Promise<void> {}

  protected async onRealtimeResponseDone(
    _event: Extract<PsRealtimeSessionEvent, { type: "response.done" }>
  ): Promise<void> {}

  protected async onRealtimeError(
    _event: Extract<PsRealtimeSessionEvent, { type: "error" }>
  ): Promise<void> {}

  protected async onRealtimeClosed(
    _event: Extract<PsRealtimeSessionEvent, { type: "closed" }>
  ): Promise<void> {}

  async setRealtimeVoiceEnabled(enabled: boolean): Promise<void> {
    if (
      enabled === this.realtimeVoiceEnabled &&
      (!enabled || this.realtimeSession || this.hasActiveRealtimeStartup())
    ) {
      return;
    }

    if (!enabled) {
      this.realtimeVoiceEnabled = false;
      await this.closeRealtimeSession();
      return;
    }

    this.realtimeVoiceEnabled = true;
    try {
      await this.refreshRealtimeSession("voice_enabled");
    } catch (error) {
      if (!this.realtimeSession && !this.hasActiveRealtimeStartup()) {
        this.realtimeVoiceEnabled = false;
      }
      throw error;
    }
  }

  async refreshRealtimeSession(reason?: string): Promise<void> {
    if (!this.realtimeVoiceEnabled) {
      return;
    }

    const options = await this.buildRealtimeSessionOptions();
    if (!this.realtimeSession) {
      const shouldRefreshAfterStartup =
        this.hasActiveRealtimeStartup() &&
        reason !== "ensure_session" &&
        reason !== "voice_enabled";
      const session = await this.startRealtimeSession(options);
      if (shouldRefreshAfterStartup) {
        await session.update(options);
      }
      return;
    }

    await this.realtimeSession.update(options);
  }

  async sendRealtimeText(
    text: string,
    response?: PsRealtimeCreateResponseOptions
  ): Promise<void> {
    await this.ensureRealtimeSession();
    const session = this.realtimeSession;
    await session?.sendText(text, {
      createResponse: true,
      response: session
        ? this.trackRealtimeResponseOptions(session, response)
        : response,
    });
  }

  async appendRealtimeAudio(audio: Uint8Array | string): Promise<void> {
    await this.ensureRealtimeSession();
    await this.realtimeSession?.appendAudio(audio);
  }

  async commitRealtimeAudio(): Promise<void> {
    await this.ensureRealtimeSession();
    await this.realtimeSession?.commitAudio();
  }

  async triggerRealtimeResponse(
    instructions: string,
    options: PsRealtimeCreateResponseOptions & {
      cancelActiveResponse?: boolean;
    } = {}
  ): Promise<void> {
    await this.ensureRealtimeSession();
    if (options.cancelActiveResponse === true) {
      await this.realtimeSession?.cancelResponse();
    }

    const { cancelActiveResponse: _cancelActiveResponse, ...responseOptions } =
      options;
    const session = this.realtimeSession;
    const response = {
      ...responseOptions,
      instructions,
    };
    await session?.createResponse(
      this.trackRealtimeResponseOptions(session, response)
    );
  }

  async closeRealtimeSession(): Promise<void> {
    this.realtimeSessionEpoch += 1;
    const pendingStartup = this.realtimeStartup;
    const session = this.realtimeSession;

    this.removeRealtimeListener?.();
    this.removeRealtimeListener = undefined;
    this.realtimeSession = undefined;

    if (session) {
      this.clearRealtimeSessionState(session);
      await session.close();
    }

    if (pendingStartup?.session && pendingStartup.session !== session) {
      pendingStartup.removeListener?.();
      this.clearRealtimeSessionState(pendingStartup.session);
      try {
        await pendingStartup.session.close();
      } catch {
        // Closing invalidates pending startups; preserve close semantics.
      }
    }
  }

  protected async buildRealtimeSessionOptions(): Promise<PsRealtimeSessionOptions> {
    const tools = await this.getRealtimeTools();
    return {
      outputModalities: ["audio"],
      ...this.realtimeDefaults,
      instructions: await this.getRealtimeSystemPrompt(),
      tools,
      metadata: await this.getRealtimeSessionMetadata(),
    };
  }

  protected async handleRealtimeEvent(
    event: PsRealtimeSessionEvent,
    eventSession = this.realtimeSession
  ): Promise<void> {
    switch (event.type) {
      case "audio.delta":
        await this.onRealtimeAudioDelta(event.delta);
        break;
      case "text.delta":
        await this.onRealtimeTextDelta(event.delta);
        break;
      case "input.transcript.done":
        await this.onRealtimeUserTranscript(event.transcript);
        break;
      case "assistant.transcript.done":
        await this.onRealtimeAssistantTranscript(event.transcript);
        break;
      case "response.created":
        this.recordRealtimeResponseOptions(event, eventSession);
        break;
      case "tool.call":
        await this.handleRealtimeToolCall(event, eventSession);
        break;
      case "response.done":
        await this.handleRealtimeResponseDone(event, eventSession);
        break;
      case "error":
        await this.onRealtimeError(event);
        break;
      case "closed":
        if (!eventSession || eventSession === this.realtimeSession) {
          this.clearRealtimeSessionReference();
        } else {
          this.clearRealtimeSessionState(eventSession);
        }
        await this.onRealtimeClosed(event);
        break;
      default:
        break;
    }
  }

  protected async handleRealtimeToolCall(
    event: Extract<PsRealtimeSessionEvent, { type: "tool.call" }>,
    eventSession = this.realtimeSession
  ): Promise<void> {
    const toolSession = eventSession;
    const pendingResponse =
      toolSession && event.responseId
        ? this.startRealtimeToolCallResponse(toolSession, event.responseId)
        : undefined;
    const tools = await this.getRealtimeTools();
    const turnResponseOptions =
      toolSession && event.responseId
        ? this.getRealtimeResponseOptions(toolSession, event.responseId)
        : undefined;
    const responseOptions = this.buildRealtimeToolResponseOptions(
      tools,
      turnResponseOptions
    );

    if (pendingResponse) {
      pendingResponse.responseOptions = responseOptions;
    }

    const result = await executeAssistantToolCall(event.call, tools, {
      allowedTools: await this.getRealtimeAllowedTools(tools),
      sessionId: toolSession?.id,
      metadata: await this.getRealtimeSessionMetadata(),
    });

    let outputSent = false;
    try {
      await this.onRealtimeToolResult(result);
      await toolSession?.sendFunctionOutput(
        event.call.callId ?? event.call.id,
        result.output,
        pendingResponse
          ? {
              createResponse: false,
            }
          : {
              createResponse: true,
              response: responseOptions,
            }
      );
      outputSent = true;
    } finally {
      if (pendingResponse) {
        await this.completeRealtimeToolCallResponse(
          pendingResponse,
          outputSent
        );
      }
    }
  }

  protected async handleRealtimeResponseDone(
    event: Extract<PsRealtimeSessionEvent, { type: "response.done" }>,
    eventSession = this.realtimeSession
  ): Promise<void> {
    const pendingResponse =
      eventSession && event.responseId
        ? this.getRealtimeToolCallResponse(eventSession, event.responseId)
        : undefined;

    if (pendingResponse && event.status === "completed") {
      pendingResponse.responseDone = true;
    } else if (pendingResponse) {
      pendingResponse.failed = true;
      this.deleteRealtimeToolCallResponse(pendingResponse);
    } else if (eventSession && event.responseId) {
      this.deleteRealtimeResponseOptions(eventSession, event.responseId);
    }

    await this.onRealtimeResponseDone(event);

    if (pendingResponse) {
      await this.maybeCreateRealtimeToolFollowUp(pendingResponse);
    }
  }

  protected async ensureRealtimeSession(): Promise<void> {
    if (!this.realtimeVoiceEnabled) {
      this.realtimeVoiceEnabled = true;
    }

    if (!this.realtimeSession) {
      await this.refreshRealtimeSession("ensure_session");
    }
  }

  protected toolResultToHiddenContext(result: PsAssistantToolResult): string {
    const context = result.hiddenContext ?? result.data ?? result.error;
    return typeof context === "string" ? context : JSON.stringify(context);
  }

  private clearRealtimeSessionReference(): void {
    if (this.realtimeSession) {
      this.clearRealtimeSessionState(this.realtimeSession);
    }
    this.removeRealtimeListener?.();
    this.removeRealtimeListener = undefined;
    this.realtimeSession = undefined;
  }

  private async startRealtimeSession(
    options: PsRealtimeSessionOptions
  ): Promise<PsRealtimeSession> {
    if (this.hasActiveRealtimeStartup() && this.realtimeStartup) {
      return this.realtimeStartup.promise;
    }

    const startupEpoch = this.realtimeSessionEpoch;
    const startupPromise = this.createConnectedRealtimeSession(
      options,
      startupEpoch
    );
    this.realtimeStartup = {
      epoch: startupEpoch,
      promise: startupPromise,
    };
    try {
      return await startupPromise;
    } finally {
      if (this.realtimeStartup?.promise === startupPromise) {
        this.realtimeStartup = undefined;
      }
    }
  }

  private async createConnectedRealtimeSession(
    options: PsRealtimeSessionOptions,
    startupEpoch: number
  ): Promise<PsRealtimeSession> {
    const session = await this.realtimeModel.createSession(options);
    const removeListener = session.onEvent((event) =>
      this.handleRealtimeEvent(event, session)
    );

    if (
      startupEpoch !== this.realtimeSessionEpoch ||
      !this.realtimeVoiceEnabled
    ) {
      removeListener();
      try {
        await session.close();
      } catch {
        // Preserve the cancellation error.
      }
      throw new Error("Realtime session startup was cancelled");
    }

    if (this.realtimeStartup?.epoch === startupEpoch) {
      this.realtimeStartup.session = session;
      this.realtimeStartup.removeListener = removeListener;
    }

    try {
      await session.connect();
    } catch (error) {
      removeListener();
      try {
        await session.close();
      } catch {
        // Preserve the original connection failure.
      }
      throw error;
    }

    if (
      startupEpoch !== this.realtimeSessionEpoch ||
      !this.realtimeVoiceEnabled
    ) {
      removeListener();
      try {
        await session.close();
      } catch {
        // Preserve the cancellation error.
      }
      throw new Error("Realtime session startup was cancelled");
    }

    this.realtimeSession = session;
    this.removeRealtimeListener = removeListener;
    return session;
  }

  private buildRealtimeToolResponseOptions(
    tools: PsAssistantTool[],
    turnResponseOptions?: PsRealtimeCreateResponseOptions
  ): PsRealtimeCreateResponseOptions {
    return {
      ...turnResponseOptions,
      tools: turnResponseOptions?.tools ?? tools,
      outputModalities:
        turnResponseOptions?.outputModalities ??
        this.realtimeDefaults.outputModalities ??
        ["audio"],
    };
  }

  private startRealtimeToolCallResponse(
    session: PsRealtimeSession,
    responseId: string
  ): PendingRealtimeToolResponse {
    let sessionResponses = this.pendingRealtimeToolResponses.get(session);
    if (!sessionResponses) {
      sessionResponses = new Map<string, PendingRealtimeToolResponse>();
      this.pendingRealtimeToolResponses.set(session, sessionResponses);
    }

    let pendingResponse = sessionResponses.get(responseId);
    if (!pendingResponse) {
      pendingResponse = {
        responseId,
        session,
        pendingToolCalls: 0,
        responseDone: false,
        responseCreated: false,
        failed: false,
      };
      sessionResponses.set(responseId, pendingResponse);
    }

    pendingResponse.pendingToolCalls += 1;
    return pendingResponse;
  }

  private getRealtimeToolCallResponse(
    session: PsRealtimeSession,
    responseId: string
  ): PendingRealtimeToolResponse | undefined {
    return this.pendingRealtimeToolResponses.get(session)?.get(responseId);
  }

  private async completeRealtimeToolCallResponse(
    pendingResponse: PendingRealtimeToolResponse,
    outputSent: boolean
  ): Promise<void> {
    pendingResponse.pendingToolCalls = Math.max(
      0,
      pendingResponse.pendingToolCalls - 1
    );
    pendingResponse.failed = pendingResponse.failed || !outputSent;
    await this.maybeCreateRealtimeToolFollowUp(pendingResponse);
  }

  private async maybeCreateRealtimeToolFollowUp(
    pendingResponse: PendingRealtimeToolResponse
  ): Promise<void> {
    if (
      pendingResponse.responseCreated ||
      pendingResponse.failed ||
      !pendingResponse.responseDone ||
      pendingResponse.pendingToolCalls > 0
    ) {
      return;
    }

    pendingResponse.responseCreated = true;
    this.deleteRealtimeToolCallResponse(pendingResponse);
    const responseOptions =
      pendingResponse.responseOptions ?? this.buildRealtimeToolResponseOptions([]);
    await pendingResponse.session.createResponse(
      this.trackRealtimeResponseOptions(pendingResponse.session, responseOptions)
    );
  }

  private deleteRealtimeToolCallResponse(
    pendingResponse: PendingRealtimeToolResponse
  ): void {
    this.deleteRealtimeResponseOptions(
      pendingResponse.session,
      pendingResponse.responseId
    );
    const sessionResponses = this.pendingRealtimeToolResponses.get(
      pendingResponse.session
    );
    if (sessionResponses?.get(pendingResponse.responseId) !== pendingResponse) {
      return;
    }

    sessionResponses.delete(pendingResponse.responseId);
    if (sessionResponses.size === 0) {
      this.pendingRealtimeToolResponses.delete(pendingResponse.session);
    }
  }

  private trackRealtimeResponseOptions(
    session: PsRealtimeSession,
    options?: PsRealtimeCreateResponseOptions
  ): PsRealtimeCreateResponseOptions | undefined {
    if (!options) {
      return undefined;
    }

    const cleanOptions = this.cloneRealtimeResponseOptions(options);
    const metadata = { ...(options.metadata ?? {}) };
    const canUseMetadataTracking =
      !Object.prototype.hasOwnProperty.call(
        metadata,
        REALTIME_RESPONSE_OPTIONS_METADATA_KEY
      ) && Object.keys(metadata).length < 16;

    if (canUseMetadataTracking) {
      const trackingId = `psrt_${++this.realtimeResponseOptionsSequence}`;
      metadata[REALTIME_RESPONSE_OPTIONS_METADATA_KEY] = trackingId;
      this.pendingRealtimeResponseOptionsByTrackingId.set(trackingId, {
        session,
        options: cleanOptions,
      });
      return {
        ...options,
        metadata,
      };
    }

    let queuedOptions = this.queuedRealtimeResponseOptions.get(session);
    if (!queuedOptions) {
      queuedOptions = [];
      this.queuedRealtimeResponseOptions.set(session, queuedOptions);
    }
    queuedOptions.push(cleanOptions);
    return this.cloneRealtimeResponseOptions(options);
  }

  private recordRealtimeResponseOptions(
    event: Extract<PsRealtimeSessionEvent, { type: "response.created" }>,
    session = this.realtimeSession
  ): void {
    if (!session || !event.responseId) {
      return;
    }

    const trackingId =
      event.metadata?.[REALTIME_RESPONSE_OPTIONS_METADATA_KEY];
    let options: PsRealtimeCreateResponseOptions | undefined;
    if (trackingId) {
      const pendingOptions =
        this.pendingRealtimeResponseOptionsByTrackingId.get(trackingId);
      if (pendingOptions?.session === session) {
        options = pendingOptions.options;
      }
      this.pendingRealtimeResponseOptionsByTrackingId.delete(trackingId);
    }

    if (!options) {
      const queuedOptions = this.queuedRealtimeResponseOptions.get(session);
      options = queuedOptions?.shift();
      if (queuedOptions?.length === 0) {
        this.queuedRealtimeResponseOptions.delete(session);
      }
    }

    if (!options) {
      return;
    }

    let sessionOptions = this.realtimeResponseOptionsByResponseId.get(session);
    if (!sessionOptions) {
      sessionOptions = new Map<string, PsRealtimeCreateResponseOptions>();
      this.realtimeResponseOptionsByResponseId.set(session, sessionOptions);
    }
    sessionOptions.set(event.responseId, options);
  }

  private getRealtimeResponseOptions(
    session: PsRealtimeSession,
    responseId: string
  ): PsRealtimeCreateResponseOptions | undefined {
    return this.realtimeResponseOptionsByResponseId.get(session)?.get(responseId);
  }

  private deleteRealtimeResponseOptions(
    session: PsRealtimeSession,
    responseId: string
  ): void {
    const sessionOptions = this.realtimeResponseOptionsByResponseId.get(session);
    sessionOptions?.delete(responseId);
    if (sessionOptions?.size === 0) {
      this.realtimeResponseOptionsByResponseId.delete(session);
    }
  }

  private clearRealtimeSessionState(session: PsRealtimeSession): void {
    this.pendingRealtimeToolResponses.delete(session);
    this.queuedRealtimeResponseOptions.delete(session);
    this.realtimeResponseOptionsByResponseId.delete(session);
    for (const [trackingId, pendingOptions] of this
      .pendingRealtimeResponseOptionsByTrackingId) {
      if (pendingOptions.session === session) {
        this.pendingRealtimeResponseOptionsByTrackingId.delete(trackingId);
      }
    }
  }

  private cloneRealtimeResponseOptions(
    options: PsRealtimeCreateResponseOptions
  ): PsRealtimeCreateResponseOptions {
    return {
      ...options,
      outputModalities: options.outputModalities
        ? [...options.outputModalities]
        : undefined,
      tools: options.tools ? [...options.tools] : undefined,
      metadata: options.metadata ? { ...options.metadata } : undefined,
    };
  }

  private hasActiveRealtimeStartup(): boolean {
    return (
      this.realtimeStartup !== undefined &&
      this.realtimeStartup.epoch === this.realtimeSessionEpoch
    );
  }
}
