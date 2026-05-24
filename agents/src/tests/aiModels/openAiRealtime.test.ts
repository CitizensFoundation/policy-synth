import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type {
  RealtimeClientEvent,
  RealtimeServerEvent,
  ResponseCreateEvent,
  SessionUpdateEvent,
} from "openai/resources/realtime/realtime";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";
import type { PsAssistantTool } from "../../base/assistantTools.js";
import {
  OpenAiRealtime,
  OpenAiSdkRealtimeSocketAdapter,
  type OpenAiRealtimeSocketLike,
} from "../../aiModels/openAiRealtime.js";

const originalEnforceEuRegion = process.env.OPENAI_ENFORCE_EU_REGION;
const originalOpenAiOverrideKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;

interface FakeRealtimeSocketOptions {
  deferReady?: boolean;
  readyError?: Error;
}

type ReadyEventName = "open" | "close" | "error";
type ReadyEventListener = (event?: { reason?: string }) => void;

class FakeReadyTarget {
  readyState = 0;
  private readonly listeners: Record<
    ReadyEventName,
    Set<ReadyEventListener>
  > = {
    open: new Set(),
    close: new Set(),
    error: new Set(),
  };

  addEventListener(
    eventName: ReadyEventName,
    listener: ReadyEventListener
  ): void {
    this.listeners[eventName].add(listener);
  }

  removeEventListener(
    eventName: ReadyEventName,
    listener: ReadyEventListener
  ): void {
    this.listeners[eventName].delete(listener);
  }

  emit(eventName: ReadyEventName, event?: { reason?: string }): void {
    for (const listener of this.listeners[eventName]) {
      listener(event);
    }
  }

  listenerCount(eventName: ReadyEventName): number {
    return this.listeners[eventName].size;
  }
}

class FakeSdkRealtimeSocket {
  constructor(public readonly socket: FakeReadyTarget) {}

  send(_event: RealtimeClientEvent): void {}

  close(): void {}

  on(
    eventName: "event",
    listener: (event: RealtimeServerEvent) => void
  ): unknown;
  on(eventName: "error", listener: (error: unknown) => void): unknown;
  on(
    _eventName: "event" | "error",
    _listener: ((event: RealtimeServerEvent) => void) | ((error: unknown) => void)
  ): unknown {
    return undefined;
  }
}

class FakeRealtimeSocket implements OpenAiRealtimeSocketLike {
  sent: RealtimeClientEvent[] = [];
  closeCallCount = 0;
  private serverEventListeners: Array<(event: RealtimeServerEvent) => void> = [];
  private errorListeners: Array<(error: unknown) => void> = [];
  private closeListeners: Array<(event?: unknown) => void> = [];
  private resolveReadyPromise?: () => void;

  constructor(private readonly options: FakeRealtimeSocketOptions = {}) {}

  async ready(): Promise<void> {
    if (this.options.readyError) {
      throw this.options.readyError;
    }

    if (!this.options.deferReady) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.resolveReadyPromise = resolve;
    });
  }

  send(event: RealtimeClientEvent): void {
    this.sent.push(event);
  }

  close(): void {
    this.closeCallCount += 1;
    this.emitClose({ code: 1000, reason: "closed" });
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
      this.serverEventListeners.push(
        listener as (event: RealtimeServerEvent) => void
      );
    } else {
      this.errorListeners.push(listener as (error: unknown) => void);
    }
    return undefined;
  }

  addCloseListener(listener: (event?: unknown) => void): void {
    this.closeListeners.push(listener);
  }

  removeCloseListener(listener: (event?: unknown) => void): void {
    this.closeListeners = this.closeListeners.filter(
      (candidate) => candidate !== listener
    );
  }

  closeListenerCount(): number {
    return this.closeListeners.length;
  }

  resolveReady(): void {
    this.resolveReadyPromise?.();
  }

  emitClose(event?: unknown): void {
    for (const listener of this.closeListeners) {
      listener(event);
    }
  }

  emitServerEvent(event: RealtimeServerEvent): void {
    for (const listener of this.serverEventListeners) {
      listener(event);
    }
  }

  emitError(error: unknown): void {
    for (const listener of this.errorListeners) {
      listener(error);
    }
  }
}

const config: PsAiModelConfig = {
  apiKey: "test-key",
  modelName: "gpt-realtime-2",
  modelType: PsAiModelType.Realtime,
  modelSize: PsAiModelSize.Small,
  prices: {
    costInTokensPerMillion: 1,
    costOutTokensPerMillion: 1,
    costInCachedContextTokensPerMillion: 1,
    currency: "USD",
  },
};

const createTool = (): PsAssistantTool => ({
  name: "show_widget",
  description: "Show a widget",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
  handler: async () => ({ success: true }),
});

const waitForMicrotask = () =>
  new Promise<void>((resolve) => setImmediate(resolve));

const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve;
  });
  return { promise, resolve };
};

afterEach(() => {
  if (originalEnforceEuRegion === undefined) {
    delete process.env.OPENAI_ENFORCE_EU_REGION;
  } else {
    process.env.OPENAI_ENFORCE_EU_REGION = originalEnforceEuRegion;
  }

  if (originalOpenAiOverrideKey === undefined) {
    delete process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
  } else {
    process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = originalOpenAiOverrideKey;
  }
});

describe("OpenAiRealtime", () => {
  it("rejects readiness when the SDK WebSocket closes before opening", async () => {
    const target = new FakeReadyTarget();
    const socket = new FakeSdkRealtimeSocket(target);
    const adapter = new OpenAiSdkRealtimeSocketAdapter(
      socket as unknown as ConstructorParameters<
        typeof OpenAiSdkRealtimeSocketAdapter
      >[0]
    );

    const readyPromise = assert.rejects(
      () => adapter.ready(),
      /closed before opening: handshake closed/
    );

    assert.equal(target.listenerCount("open"), 1);
    assert.equal(target.listenerCount("error"), 1);
    assert.equal(target.listenerCount("close"), 1);

    target.emit("close", { reason: "handshake closed" });
    await readyPromise;

    assert.equal(target.listenerCount("open"), 0);
    assert.equal(target.listenerCount("error"), 0);
    assert.equal(target.listenerCount("close"), 0);
  });

  it("maps PolicySynth session options to current OpenAI session.update payload", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async ({ model }) => {
      assert.equal(model, "gpt-realtime-2");
      return fakeSocket;
    });

    const session = await model.createSession({
      instructions: "Be brief",
      voice: "marin",
      outputModalities: ["audio"],
      inputAudioFormat: "pcm16",
      outputAudioFormat: "g711_ulaw",
      inputAudioTranscription: { model: "whisper-1", language: "en" },
      turnDetection: {
        type: "server_vad",
        threshold: 0.5,
        prefixPaddingMs: 300,
        silenceDurationMs: 500,
      },
      reasoningEffort: "high",
      parallelToolCalls: true,
      maxOutputTokens: 512,
      tools: [createTool()],
      toolChoice: "auto",
    });

    await session.connect();

    assert.equal(fakeSocket.sent.length, 1);
    const update = fakeSocket.sent[0] as SessionUpdateEvent;
    assert.equal(update.type, "session.update");
    assert.equal(update.session.type, "realtime");
    assert.equal(update.session.model, undefined);
    assert.equal(update.session.instructions, "Be brief");
    assert.deepEqual(update.session.output_modalities, ["audio"]);
    assert.equal(update.session.reasoning?.effort, "high");
    assert.equal(update.session.parallel_tool_calls, true);
    assert.equal(update.session.max_output_tokens, 512);
    assert.equal(update.session.audio?.input?.format?.type, "audio/pcm");
    assert.equal(update.session.audio?.input?.format?.rate, 24000);
    assert.equal(update.session.audio?.output?.format?.type, "audio/pcmu");
    assert.equal(update.session.audio?.input?.transcription?.model, "whisper-1");
    assert.equal(update.session.audio?.input?.turn_detection?.type, "server_vad");
    const firstTool = update.session.tools?.[0] as { name?: string } | undefined;
    assert.equal(firstTool?.name, "show_widget");
  });

  it("uses model maxTokensOut as the default realtime session output limit", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(
      {
        ...config,
        maxTokensOut: 768,
      },
      async () => fakeSocket
    );

    const session = await model.createSession({ instructions: "Limit output" });
    await session.connect();

    const update = fakeSocket.sent[0] as SessionUpdateEvent;
    assert.equal(update.type, "session.update");
    assert.equal(update.session.type, "realtime");
    assert.equal(update.session.max_output_tokens, 768);
  });

  it("lets realtime session maxOutputTokens override the model default", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(
      {
        ...config,
        maxTokensOut: 768,
      },
      async () => fakeSocket
    );

    const session = await model.createSession({
      instructions: "Override output",
      maxOutputTokens: 128,
    });
    await session.connect();

    const update = fakeSocket.sent[0] as SessionUpdateEvent;
    assert.equal(update.type, "session.update");
    assert.equal(update.session.type, "realtime");
    assert.equal(update.session.max_output_tokens, 128);
  });

  it("waits for the WebSocket ready signal before sending session configuration", async () => {
    const fakeSocket = new FakeRealtimeSocket({ deferReady: true });
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession({ instructions: "Wait for open" });

    const connectPromise = session.connect();
    await waitForMicrotask();

    assert.equal(fakeSocket.sent.length, 0);

    fakeSocket.resolveReady();
    await connectPromise;

    assert.equal(fakeSocket.sent.length, 1);
    assert.equal(fakeSocket.sent[0].type, "session.update");
  });

  it("reuses an in-flight WebSocket startup for concurrent connect calls", async () => {
    const fakeSocket = new FakeRealtimeSocket({ deferReady: true });
    let factoryCallCount = 0;
    const model = new OpenAiRealtime(config, async () => {
      factoryCallCount += 1;
      return fakeSocket;
    });
    const session = await model.createSession({
      instructions: "Connect once",
    });

    const firstConnect = session.connect();
    const secondConnect = session.connect();
    await waitForMicrotask();

    assert.equal(factoryCallCount, 1);
    assert.equal(fakeSocket.closeListenerCount(), 1);
    assert.equal(fakeSocket.sent.length, 0);

    fakeSocket.resolveReady();
    await Promise.all([firstConnect, secondConnect]);

    assert.equal(factoryCallCount, 1);
    assert.equal(fakeSocket.sent.length, 1);
    assert.equal(fakeSocket.sent[0].type, "session.update");
  });

  it("cancels a pending WebSocket factory startup when the session is closed", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const socketFactory = createDeferred<OpenAiRealtimeSocketLike>();
    const model = new OpenAiRealtime(config, async () => socketFactory.promise);
    const session = await model.createSession({ instructions: "Do not send" });
    const closedEvents: string[] = [];

    session.onEvent((event) => {
      if (event.type === "closed") {
        closedEvents.push(event.reason ?? "");
      }
    });

    const connectPromise = session.connect();
    await waitForMicrotask();

    const closeResult = await Promise.race([
      session.close().then(() => "closed"),
      waitForMicrotask().then(() => "pending"),
    ]);
    assert.equal(closeResult, "closed");

    socketFactory.resolve(fakeSocket);
    await assert.rejects(
      () => connectPromise,
      /closed before ready/
    );

    assert.equal(fakeSocket.closeCallCount, 1);
    assert.equal(fakeSocket.sent.length, 0);
    assert.deepEqual(closedEvents, ["closed"]);
  });

  it("does not mark the session connected when the WebSocket fails to become ready", async () => {
    const failedSocket = new FakeRealtimeSocket({
      readyError: new Error("socket open failed"),
    });
    const retrySocket = new FakeRealtimeSocket();
    let socketIndex = 0;
    const sockets = [failedSocket, retrySocket];
    const model = new OpenAiRealtime(config, async () => sockets[socketIndex++]);
    const session = await model.createSession({ instructions: "Never sent" });

    await assert.rejects(() => session.connect(), /socket open failed/);
    assert.equal(failedSocket.sent.length, 0);
    assert.equal(failedSocket.closeListenerCount(), 0);
    assert.equal(failedSocket.closeCallCount, 1);
    await assert.rejects(
      () => session.sendText("hello", { createResponse: false }),
      /not connected/
    );

    await session.connect();

    assert.equal(retrySocket.closeListenerCount(), 1);
    assert.equal(retrySocket.sent.length, 1);
    assert.equal(retrySocket.sent[0].type, "session.update");
  });

  it("normalizes OpenAI realtime server events", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession();
    const events: string[] = [];

    session.onEvent((event) => {
      events.push(event.type);
      if (event.type === "audio.delta") {
        assert.equal(event.delta, "audio-data");
      }
      if (event.type === "text.delta") {
        assert.equal(event.delta, "hello");
      }
      if (event.type === "tool.call") {
        assert.equal(event.call.name, "show_widget");
        assert.equal(event.call.callId, "call_1");
      }
      if (event.type === "response.done") {
        assert.equal(event.usage?.audioOutputTokens, 7);
      }
    });

    await session.connect();

    fakeSocket.emitServerEvent({
      type: "response.output_audio.delta",
      event_id: "evt_audio",
      response_id: "resp_1",
      item_id: "item_1",
      output_index: 0,
      content_index: 0,
      delta: "audio-data",
    } as RealtimeServerEvent);
    fakeSocket.emitServerEvent({
      type: "response.output_text.delta",
      event_id: "evt_text",
      response_id: "resp_1",
      item_id: "item_1",
      output_index: 0,
      content_index: 0,
      delta: "hello",
    } as RealtimeServerEvent);
    fakeSocket.emitServerEvent({
      type: "conversation.item.input_audio_transcription.completed",
      event_id: "evt_transcript",
      item_id: "item_user",
      content_index: 0,
      transcript: "user said hi",
      usage: { type: "tokens", input_tokens: 1, output_tokens: 1 },
    } as RealtimeServerEvent);
    fakeSocket.emitServerEvent({
      type: "response.function_call_arguments.done",
      event_id: "evt_tool",
      response_id: "resp_1",
      item_id: "item_tool",
      output_index: 0,
      call_id: "call_1",
      name: "show_widget",
      arguments: "{\"id\":\"one\"}",
    } as RealtimeServerEvent);
    fakeSocket.emitServerEvent({
      type: "response.done",
      event_id: "evt_done",
      response: {
        id: "resp_1",
        status: "completed",
        usage: {
          input_tokens: 3,
          output_tokens: 9,
          total_tokens: 12,
          output_token_details: { audio_tokens: 7, text_tokens: 2 },
        },
      },
    } as RealtimeServerEvent);

    await waitForMicrotask();

    assert.deepEqual(events, [
      "audio.delta",
      "text.delta",
      "input.transcript.done",
      "tool.call",
      "response.done",
    ]);
  });

  it("sends text, audio, function output, and response control events", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession();
    await session.connect();

    await session.sendText("Hello", {
      response: { instructions: "Answer in audio", outputModalities: ["audio"] },
    });
    await session.appendAudio(Buffer.from("abc"));
    await session.commitAudio();
    await session.sendFunctionOutput("call_1", "{\"ok\":true}", {
      createResponse: true,
      response: { instructions: "Summarize the tool result" },
    });
    await session.cancelResponse("resp_1");

    assert.deepEqual(
      fakeSocket.sent.map((event) => event.type),
      [
        "conversation.item.create",
        "response.create",
        "input_audio_buffer.append",
        "input_audio_buffer.commit",
        "conversation.item.create",
        "response.create",
        "response.cancel",
      ]
    );
  });

  it("sends empty tool arrays when clearing session or response tools", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession({ tools: [createTool()] });
    await session.connect();

    await session.update({ tools: [] });
    await session.createResponse({ tools: [] });

    const clearSessionTools = fakeSocket.sent[1] as SessionUpdateEvent;
    assert.equal(clearSessionTools.type, "session.update");
    assert.equal(clearSessionTools.session.type, "realtime");
    if (clearSessionTools.session.type !== "realtime") {
      assert.fail("Expected a realtime session update");
    }
    assert.deepEqual(clearSessionTools.session.tools, []);

    const clearResponseTools = fakeSocket.sent[2] as ResponseCreateEvent;
    assert.equal(clearResponseTools.type, "response.create");
    assert.deepEqual(clearResponseTools.response?.tools, []);
  });

  it("omits immutable fields from subsequent session updates", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession({
      model: "gpt-realtime-2",
      voice: "marin",
      tracing: "auto",
      outputModalities: ["audio"],
      instructions: "Initial instructions",
    });
    await session.connect();

    await session.update({
      model: "gpt-realtime-2",
      voice: "marin",
      tracing: "auto",
      outputModalities: ["audio"],
      instructions: "Updated instructions",
      tools: [],
    });

    const initialUpdate = fakeSocket.sent[0] as SessionUpdateEvent;
    assert.equal(initialUpdate.session.type, "realtime");
    if (initialUpdate.session.type !== "realtime") {
      assert.fail("Expected a realtime session update");
    }
    assert.equal(initialUpdate.session.model, undefined);
    assert.equal(initialUpdate.session.audio?.output?.voice, "marin");
    assert.equal(initialUpdate.session.tracing, "auto");

    const refreshUpdate = fakeSocket.sent[1] as SessionUpdateEvent;
    assert.equal(refreshUpdate.session.type, "realtime");
    if (refreshUpdate.session.type !== "realtime") {
      assert.fail("Expected a realtime session update");
    }
    assert.equal(refreshUpdate.session.model, undefined);
    assert.equal(refreshUpdate.session.audio?.output?.voice, undefined);
    assert.equal(refreshUpdate.session.tracing, undefined);
    assert.equal(refreshUpdate.session.instructions, "Updated instructions");
    assert.deepEqual(refreshUpdate.session.output_modalities, ["audio"]);
    assert.deepEqual(refreshUpdate.session.tools, []);
  });

  it("passes configured EU regional endpoint details to the realtime socket factory", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const captured: Array<{
      apiKey: string;
      model: string;
      baseURL?: string;
      regionalProcessing?: PsOpenAiRegionalProcessing;
    }> = [];
    const model = new OpenAiRealtime(
      {
        ...config,
        regionalProcessing: "eu",
      },
      async (params) => {
        captured.push(params);
        return fakeSocket;
      }
    );

    const session = await model.createSession({ instructions: "EU" });
    await session.connect();

    assert.equal(captured[0].apiKey, "test-key");
    assert.equal(captured[0].model, "gpt-realtime-2");
    assert.equal(captured[0].baseURL, "https://eu.api.openai.com/v1");
    assert.equal(captured[0].regionalProcessing, "eu");
    assert.equal(model.config.regionalProcessing, "eu");
  });

  it("honors OPENAI_ENFORCE_EU_REGION for realtime socket creation", async () => {
    process.env.OPENAI_ENFORCE_EU_REGION = "true";
    const fakeSocket = new FakeRealtimeSocket();
    const captured: Array<{
      baseURL?: string;
      regionalProcessing?: PsOpenAiRegionalProcessing;
    }> = [];
    const model = new OpenAiRealtime(config, async (params) => {
      captured.push(params);
      return fakeSocket;
    });

    const session = await model.createSession({ instructions: "Forced EU" });
    await session.connect();

    assert.equal(captured[0].baseURL, "https://eu.api.openai.com/v1");
    assert.equal(captured[0].regionalProcessing, "eu");
    assert.equal(model.config.regionalProcessing, "eu");
  });

  it("deduplicates API error events while still emitting transport errors", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession();
    const errors: string[] = [];

    session.onEvent((event) => {
      if (event.type === "error") {
        errors.push(event.message);
      }
    });

    await session.connect();
    fakeSocket.emitServerEvent({
      type: "error",
      event_id: "evt_error",
      error: {
        message: "Bad realtime request",
        type: "invalid_request_error",
        code: "bad_request",
        event_id: "client_event",
        param: "session.model",
      },
    } as RealtimeServerEvent);
    fakeSocket.emitError({
      event_id: "evt_error",
      error: {
        message: "Bad realtime request",
        type: "invalid_request_error",
      },
      message: "Bad realtime request code=bad_request",
    });
    fakeSocket.emitError(new Error("socket dropped"));

    await waitForMicrotask();

    assert.deepEqual(errors, ["Bad realtime request", "socket dropped"]);
  });

  it("reports rejected realtime event listeners without unhandled rejection", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession();
    const errors: string[] = [];
    let textDeliveredToSecondListener = false;

    session.onEvent(async (event) => {
      if (event.type === "text.delta") {
        throw new Error("listener exploded");
      }
    });
    session.onEvent((event) => {
      if (event.type === "text.delta") {
        textDeliveredToSecondListener = true;
      }
      if (event.type === "error") {
        errors.push(event.message);
      }
    });

    await session.connect();
    fakeSocket.emitServerEvent({
      type: "response.output_text.delta",
      event_id: "evt_text_listener_error",
      response_id: "resp_listener_error",
      item_id: "item_listener_error",
      output_index: 0,
      content_index: 0,
      delta: "hello",
    } as RealtimeServerEvent);
    await waitForMicrotask();

    assert.equal(textDeliveredToSecondListener, true);
    assert.deepEqual(errors, [
      "Realtime event listener failed: listener exploded",
    ]);
  });

  it("emits a normalized close event when the remote WebSocket closes", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession();
    const closeEvents: Array<{ code?: number; reason?: string }> = [];

    session.onEvent((event) => {
      if (event.type === "closed") {
        closeEvents.push({ code: event.code, reason: event.reason });
      }
    });

    await session.connect();
    fakeSocket.emitClose({ code: 4001, reason: "remote_closed" });
    await waitForMicrotask();
    await session.close();

    assert.equal(fakeSocket.closeListenerCount(), 0);
    assert.equal(fakeSocket.closeCallCount, 0);
    assert.deepEqual(closeEvents, [
      { code: 4001, reason: "remote_closed" },
    ]);
  });

  it("removes the remote close listener and emits one local close event on close", async () => {
    const fakeSocket = new FakeRealtimeSocket();
    const model = new OpenAiRealtime(config, async () => fakeSocket);
    const session = await model.createSession();
    const closeEvents: Array<{ code?: number; reason?: string }> = [];

    session.onEvent((event) => {
      if (event.type === "closed") {
        closeEvents.push({ code: event.code, reason: event.reason });
      }
    });

    await session.connect();
    assert.equal(fakeSocket.closeListenerCount(), 1);

    await session.close();

    assert.equal(fakeSocket.closeListenerCount(), 0);
    assert.equal(fakeSocket.closeCallCount, 1);
    assert.deepEqual(closeEvents, [{ code: 1000, reason: "closed" }]);
  });
});
