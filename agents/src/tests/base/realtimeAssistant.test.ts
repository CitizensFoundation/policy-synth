import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";
import {
  executeAssistantToolCall,
  type PsAssistantTool,
  type PsAssistantToolCall,
} from "../../base/assistantTools.js";
import { PolicySynthRealtimeAssistantBase } from "../../base/realtimeAssistant.js";
import {
  BaseRealtimeModel,
  type PsRealtimeCreateResponseOptions,
  type PsRealtimeFunctionOutputOptions,
  type PsRealtimeSendTextOptions,
  type PsRealtimeSession,
  type PsRealtimeSessionEvent,
  type PsRealtimeSessionEventHandler,
  type PsRealtimeSessionOptions,
} from "../../aiModels/baseRealtimeModel.js";

type ToolHandlerResult = Awaited<ReturnType<PsAssistantTool["handler"]>>;

class FakeRealtimeSession implements PsRealtimeSession {
  connected = false;
  updates: PsRealtimeSessionOptions[] = [];
  texts: Array<{ text: string; options?: PsRealtimeSendTextOptions }> = [];
  audioChunks: Array<Uint8Array | string> = [];
  committed = 0;
  cancelled = 0;
  responses: PsRealtimeCreateResponseOptions[] = [];
  functionOutputs: Array<{
    callId: string;
    output: string;
    options?: PsRealtimeFunctionOutputOptions;
  }> = [];
  closed = false;
  private listeners = new Set<PsRealtimeSessionEventHandler>();
  private resolveConnectPromise?: () => void;

  constructor(
    public readonly id = "sess_test",
    private readonly connectError?: Error,
    private readonly deferConnect = false
  ) {}

  async connect(): Promise<void> {
    if (this.connectError) {
      throw this.connectError;
    }

    if (this.deferConnect) {
      await new Promise<void>((resolve) => {
        this.resolveConnectPromise = resolve;
      });
    }

    this.connected = true;
  }

  async update(options: PsRealtimeSessionOptions): Promise<void> {
    this.updates.push(options);
  }

  async sendText(
    text: string,
    options?: PsRealtimeSendTextOptions
  ): Promise<void> {
    this.texts.push({ text, options });
  }

  async appendAudio(audio: Uint8Array | string): Promise<void> {
    this.audioChunks.push(audio);
  }

  async commitAudio(): Promise<void> {
    this.committed += 1;
  }

  async cancelResponse(): Promise<void> {
    this.cancelled += 1;
  }

  async createResponse(options?: PsRealtimeCreateResponseOptions): Promise<void> {
    this.responses.push(options ?? {});
  }

  async sendFunctionOutput(
    callId: string,
    output: string,
    options?: PsRealtimeFunctionOutputOptions
  ): Promise<void> {
    this.functionOutputs.push({ callId, output, options });
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  onEvent(listener: PsRealtimeSessionEventHandler): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  listenerCount(): number {
    return this.listeners.size;
  }

  resolveConnect(): void {
    this.resolveConnectPromise?.();
  }

  async emit(event: PsRealtimeSessionEvent): Promise<void> {
    for (const listener of this.listeners) {
      await listener(event);
    }
  }
}

class FakeRealtimeModel extends BaseRealtimeModel {
  sessions: FakeRealtimeSession[] = [];
  options: PsRealtimeSessionOptions[] = [];
  connectErrors: Array<Error | undefined> = [];
  deferredConnects: boolean[] = [];

  constructor() {
    super(
      {
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
      },
      "gpt-realtime-2"
    );
  }

  async createSession(
    options: PsRealtimeSessionOptions = {}
  ): Promise<PsRealtimeSession> {
    this.options.push(options);
    const session = new FakeRealtimeSession(
      `sess_${this.sessions.length + 1}`,
      this.connectErrors.shift(),
      this.deferredConnects.shift() ?? false
    );
    this.sessions.push(session);
    return session;
  }
}

class TestRealtimeAssistant extends PolicySynthRealtimeAssistantBase {
  prompt = "System prompt";
  tools: PsAssistantTool[] = [];
  textDeltas: string[] = [];
  audioDeltas: string[] = [];
  userTranscripts: string[] = [];
  assistantTranscripts: string[] = [];
  toolResults: string[] = [];
  errors: string[] = [];
  closedEvents: Array<{ code?: number; reason?: string }> = [];

  constructor(model: FakeRealtimeModel, defaults: PsRealtimeSessionOptions = {}) {
    super(model, { voice: "marin", outputModalities: ["audio"], ...defaults });
  }

  protected getRealtimeSystemPrompt(): string {
    return this.prompt;
  }

  protected getRealtimeTools(): PsAssistantTool[] {
    return this.tools;
  }

  protected async onRealtimeTextDelta(text: string): Promise<void> {
    this.textDeltas.push(text);
  }

  protected async onRealtimeAudioDelta(base64Audio: string): Promise<void> {
    this.audioDeltas.push(base64Audio);
  }

  protected async onRealtimeUserTranscript(text: string): Promise<void> {
    this.userTranscripts.push(text);
  }

  protected async onRealtimeAssistantTranscript(text: string): Promise<void> {
    this.assistantTranscripts.push(text);
  }

  protected async onRealtimeToolResult(result: {
    output: string;
  }): Promise<void> {
    this.toolResults.push(result.output);
  }

  protected async onRealtimeError(event: {
    message: string;
  }): Promise<void> {
    this.errors.push(event.message);
  }

  protected async onRealtimeClosed(event: {
    code?: number;
    reason?: string;
  }): Promise<void> {
    this.closedEvents.push({ code: event.code, reason: event.reason });
  }
}

const waitForMicrotask = () =>
  new Promise<void>((resolve) => setImmediate(resolve));

const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve;
  });
  return { promise, resolve };
};

describe("assistant tool execution", () => {
  it("parses valid tool calls and returns structured errors for invalid calls", async () => {
    const tool: PsAssistantTool = {
      name: "lookup",
      parameters: { type: "object" },
      handler: async (args) => ({
        success: true,
        data: { id: args.id },
      }),
    };

    const valid = await executeAssistantToolCall(
      { id: "item_1", name: "lookup", arguments: "{\"id\":42}" },
      [tool]
    );
    assert.equal(valid.result.success, true);
    assert.equal(valid.output, "{\"id\":42}");

    const invalidJson = await executeAssistantToolCall(
      { id: "item_2", name: "lookup", arguments: "{" },
      [tool]
    );
    assert.equal(invalidJson.result.success, false);
    assert.match(invalidJson.output, /Expected|JSON|property/i);

    const disallowed = await executeAssistantToolCall(
      { id: "item_3", name: "lookup", arguments: "{}" },
      [tool],
      { allowedTools: ["other_tool"] }
    );
    assert.equal(disallowed.result.success, false);
    assert.match(disallowed.output, /not allowed/);

    const hiddenContextTool: PsAssistantTool = {
      name: "lookup_hidden_context",
      parameters: { type: "object" },
      handler: async () => ({
        success: true,
        data: { visibleToClient: true },
        hiddenContext: "model-only context",
      }),
    };
    const hiddenContextResult = await executeAssistantToolCall(
      {
        id: "item_4",
        name: "lookup_hidden_context",
        arguments: "{}",
      },
      [hiddenContextTool]
    );
    assert.equal(hiddenContextResult.output, "model-only context");
  });
});

describe("PolicySynthRealtimeAssistantBase", () => {
  it("creates, refreshes, and closes a realtime session", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);

    await assistant.setRealtimeVoiceEnabled(true);
    assert.equal(model.sessions.length, 1);
    assert.equal(model.sessions[0].connected, true);
    assert.equal(model.options[0].instructions, "System prompt");
    assert.equal(model.options[0].voice, "marin");

    assistant.prompt = "Updated prompt";
    await assistant.refreshRealtimeSession("mode_changed");
    assert.equal(model.sessions[0].updates[0].instructions, "Updated prompt");

    await assistant.closeRealtimeSession();
    assert.equal(model.sessions[0].closed, true);
  });

  it("clears the cached session on remote close and recreates on the next send", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);

    await assistant.setRealtimeVoiceEnabled(true);
    const firstSession = model.sessions[0];

    await firstSession.emit({
      type: "closed",
      code: 4001,
      reason: "remote_closed",
      rawEvent: {},
    });

    assert.equal(firstSession.listenerCount(), 0);
    assert.deepEqual(assistant.closedEvents, [
      { code: 4001, reason: "remote_closed" },
    ]);

    await assistant.sendRealtimeText("after reconnect");

    assert.equal(model.sessions.length, 2);
    assert.equal(model.sessions[1].connected, true);
    assert.equal(model.sessions[1].texts[0].text, "after reconnect");
  });

  it("cleans up failed connects so retries create a fresh session", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    model.connectErrors.push(new Error("bad realtime key"));

    await assert.rejects(
      () => assistant.setRealtimeVoiceEnabled(true),
      /bad realtime key/
    );

    assert.equal(model.sessions.length, 1);
    assert.equal(model.sessions[0].closed, true);
    assert.equal(model.sessions[0].listenerCount(), 0);

    await assistant.sendRealtimeText("retry");

    assert.equal(model.sessions.length, 2);
    assert.equal(model.sessions[1].connected, true);
    assert.equal(model.sessions[1].texts[0].text, "retry");
  });

  it("retries setRealtimeVoiceEnabled(true) after a failed startup", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    model.connectErrors.push(new Error("temporary realtime failure"));

    await assert.rejects(
      () => assistant.setRealtimeVoiceEnabled(true),
      /temporary realtime failure/
    );

    await assistant.setRealtimeVoiceEnabled(true);

    assert.equal(model.sessions.length, 2);
    assert.equal(model.sessions[0].closed, true);
    assert.equal(model.sessions[1].connected, true);
  });

  it("reuses an in-flight realtime startup for concurrent sends", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    model.deferredConnects.push(true);

    const sendText = assistant.sendRealtimeText("hello");
    const appendAudio = assistant.appendRealtimeAudio("base64-audio");
    await waitForMicrotask();

    assert.equal(model.sessions.length, 1);
    assert.equal(model.sessions[0].connected, false);

    model.sessions[0].resolveConnect();
    await Promise.all([sendText, appendAudio]);

    assert.equal(model.sessions.length, 1);
    assert.equal(model.sessions[0].connected, true);
    assert.equal(model.sessions[0].texts[0].text, "hello");
    assert.deepEqual(model.sessions[0].audioChunks, ["base64-audio"]);
  });

  it("closes a pending startup when voice is disabled before connect completes", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    model.deferredConnects.push(true);

    const sendText = assistant.sendRealtimeText("stale");
    await waitForMicrotask();

    assert.equal(model.sessions.length, 1);
    assert.equal(model.sessions[0].connected, false);

    const disableVoice = assistant.setRealtimeVoiceEnabled(false);
    const disableResult = await Promise.race([
      disableVoice.then(() => "closed"),
      waitForMicrotask().then(() => "pending"),
    ]);

    assert.equal(disableResult, "closed");
    assert.equal(model.sessions[0].closed, true);
    assert.equal(model.sessions[0].listenerCount(), 0);
    model.sessions[0].resolveConnect();
    await assert.rejects(sendText, /startup was cancelled/);

    assert.equal(model.sessions[0].closed, true);
    assert.equal(model.sessions[0].listenerCount(), 0);
    assert.equal(model.sessions[0].texts.length, 0);

    await assistant.sendRealtimeText("fresh");

    assert.equal(model.sessions.length, 2);
    assert.equal(model.sessions[1].connected, true);
    assert.equal(model.sessions[1].texts[0].text, "fresh");
  });

  it("closes a pending startup when closeRealtimeSession wins the startup race", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    model.deferredConnects.push(true);

    const sendText = assistant.sendRealtimeText("stale");
    await waitForMicrotask();

    const closeSession = assistant.closeRealtimeSession();
    const closeResult = await Promise.race([
      closeSession.then(() => "closed"),
      waitForMicrotask().then(() => "pending"),
    ]);

    assert.equal(closeResult, "closed");
    assert.equal(model.sessions[0].closed, true);
    assert.equal(model.sessions[0].listenerCount(), 0);
    model.sessions[0].resolveConnect();
    await assert.rejects(sendText, /startup was cancelled/);

    assert.equal(model.sessions[0].closed, true);
    assert.equal(model.sessions[0].listenerCount(), 0);

    await assistant.sendRealtimeText("fresh");

    assert.equal(model.sessions.length, 2);
    assert.equal(model.sessions[1].connected, true);
    assert.equal(model.sessions[1].texts[0].text, "fresh");
  });

  it("routes normalized realtime events to hooks and tool output", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    const handledCalls: PsAssistantToolCall[] = [];
    assistant.tools = [
      {
        name: "show_widget",
        parameters: { type: "object" },
        handler: async (args, context) => {
          handledCalls.push({
            id: context.callId,
            name: context.toolName,
            arguments: args,
          });
          return {
            success: true,
            data: { visible: true, id: args.id },
            html: "<x-widget></x-widget>",
            clientEvents: [{ name: "ui_click", details: { target: "x" } }],
          };
        },
      },
    ];

    await assistant.setRealtimeVoiceEnabled(true);
    const session = model.sessions[0];

    await session.emit({ type: "text.delta", delta: "hi", rawEvent: {} });
    await session.emit({
      type: "audio.delta",
      delta: "audio",
      rawEvent: {},
    });
    await session.emit({
      type: "input.transcript.done",
      transcript: "hello",
      rawEvent: {},
    });
    await session.emit({
      type: "assistant.transcript.done",
      transcript: "welcome",
      rawEvent: {},
    });
    await session.emit({
      type: "tool.call",
      call: {
        id: "item_tool",
        callId: "call_tool",
        name: "show_widget",
        arguments: "{\"id\":\"a\"}",
      },
      rawEvent: {},
    });

    assert.deepEqual(assistant.textDeltas, ["hi"]);
    assert.deepEqual(assistant.audioDeltas, ["audio"]);
    assert.deepEqual(assistant.userTranscripts, ["hello"]);
    assert.deepEqual(assistant.assistantTranscripts, ["welcome"]);
    assert.equal(handledCalls.length, 1);
    assert.equal(session.functionOutputs[0].callId, "call_tool");
    assert.equal(session.functionOutputs[0].output, "{\"visible\":true,\"id\":\"a\"}");
    assert.equal(session.functionOutputs[0].options?.createResponse, true);
    assert.deepEqual(assistant.toolResults, ["{\"visible\":true,\"id\":\"a\"}"]);
  });

  it("sends delayed tool outputs through the session that emitted the tool call", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    const deferredTool = createDeferred<ToolHandlerResult>();
    assistant.tools = [
      {
        name: "slow_widget",
        parameters: { type: "object" },
        handler: async () => deferredTool.promise,
      },
    ];

    await assistant.setRealtimeVoiceEnabled(true);
    const firstSession = model.sessions[0];

    const toolEvent = firstSession.emit({
      type: "tool.call",
      call: {
        id: "item_slow_tool",
        callId: "call_slow_tool",
        name: "slow_widget",
        arguments: "{\"id\":\"slow\"}",
      },
      rawEvent: {},
    });
    await waitForMicrotask();

    await firstSession.emit({
      type: "closed",
      code: 4001,
      reason: "remote_closed",
      rawEvent: {},
    });
    await assistant.sendRealtimeText("new session");

    const secondSession = model.sessions[1];
    deferredTool.resolve({
      success: true,
      data: { visible: true },
    });
    await toolEvent;

    assert.equal(firstSession.functionOutputs.length, 1);
    assert.equal(firstSession.functionOutputs[0].callId, "call_slow_tool");
    assert.equal(firstSession.functionOutputs[0].output, "{\"visible\":true}");
    assert.equal(secondSession.functionOutputs.length, 0);
    assert.equal(secondSession.texts[0].text, "new session");
  });

  it("creates one follow-up response after parallel tool calls finish", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model, {
      parallelToolCalls: true,
    });
    const firstTool = createDeferred<ToolHandlerResult>();
    const secondTool = createDeferred<ToolHandlerResult>();
    assistant.tools = [
      {
        name: "first_widget",
        parameters: { type: "object" },
        handler: async () => firstTool.promise,
      },
      {
        name: "second_widget",
        parameters: { type: "object" },
        handler: async () => secondTool.promise,
      },
    ];

    await assistant.setRealtimeVoiceEnabled(true);
    const session = model.sessions[0];

    const firstToolCall = session.emit({
      type: "tool.call",
      responseId: "resp_parallel_tools",
      call: {
        id: "item_first_tool",
        callId: "call_first_tool",
        name: "first_widget",
        arguments: "{}",
      },
      rawEvent: {},
    });
    const secondToolCall = session.emit({
      type: "tool.call",
      responseId: "resp_parallel_tools",
      call: {
        id: "item_second_tool",
        callId: "call_second_tool",
        name: "second_widget",
        arguments: "{}",
      },
      rawEvent: {},
    });
    await waitForMicrotask();

    await session.emit({
      type: "response.done",
      responseId: "resp_parallel_tools",
      status: "completed",
      rawEvent: {},
    });

    firstTool.resolve({ success: true, data: { first: true } });
    await firstToolCall;

    assert.equal(session.functionOutputs.length, 1);
    assert.equal(session.functionOutputs[0].callId, "call_first_tool");
    assert.equal(session.functionOutputs[0].options?.createResponse, false);
    assert.equal(session.responses.length, 0);

    secondTool.resolve({ success: true, data: { second: true } });
    await secondToolCall;

    assert.equal(session.functionOutputs.length, 2);
    assert.equal(session.functionOutputs[1].callId, "call_second_tool");
    assert.equal(session.functionOutputs[1].options?.createResponse, false);
    assert.equal(session.responses.length, 1);
    assert.deepEqual(session.responses[0].outputModalities, ["audio"]);
    assert.equal(session.responses[0].tools?.length, 2);
  });

  it("preserves per-turn response options for tool follow-up responses", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    assistant.tools = [
      {
        name: "lookup_widget",
        parameters: { type: "object" },
        handler: async () => ({ success: true, data: { visible: true } }),
      },
    ];

    await assistant.sendRealtimeText("hello", {
      instructions: "Stay terse",
      outputModalities: ["text"],
      maxOutputTokens: 64,
      metadata: { turn: "text-only" },
    });
    const session = model.sessions[0];
    const trackedResponse = session.texts[0].options?.response;

    await session.emit({
      type: "response.created",
      responseId: "resp_text_tool",
      metadata: trackedResponse?.metadata,
      rawEvent: {},
    });
    await session.emit({
      type: "tool.call",
      responseId: "resp_text_tool",
      call: {
        id: "item_lookup_widget",
        callId: "call_lookup_widget",
        name: "lookup_widget",
        arguments: "{}",
      },
      rawEvent: {},
    });
    await session.emit({
      type: "response.done",
      responseId: "resp_text_tool",
      status: "completed",
      rawEvent: {},
    });

    assert.equal(session.responses.length, 1);
    assert.deepEqual(session.responses[0].outputModalities, ["text"]);
    assert.equal(session.responses[0].instructions, "Stay terse");
    assert.equal(session.responses[0].maxOutputTokens, 64);
    assert.equal(session.responses[0].metadata?.turn, "text-only");
    assert.equal(session.responses[0].tools?.length, 1);
  });

  it("tracks tool follow-up response options for chained tool calls", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    assistant.tools = [
      {
        name: "chain_widget",
        parameters: { type: "object" },
        handler: async () => ({ success: true, data: { visible: true } }),
      },
    ];

    await assistant.sendRealtimeText("hello", {
      instructions: "Stay text-only",
      outputModalities: ["text"],
      maxOutputTokens: 32,
      metadata: { turn: "chain" },
    });
    const session = model.sessions[0];

    await session.emit({
      type: "response.created",
      responseId: "resp_chain_1",
      metadata: session.texts[0].options?.response?.metadata,
      rawEvent: {},
    });
    await session.emit({
      type: "tool.call",
      responseId: "resp_chain_1",
      call: {
        id: "item_chain_1",
        callId: "call_chain_1",
        name: "chain_widget",
        arguments: "{}",
      },
      rawEvent: {},
    });
    await session.emit({
      type: "response.done",
      responseId: "resp_chain_1",
      status: "completed",
      rawEvent: {},
    });

    assert.equal(session.responses.length, 1);
    assert.deepEqual(session.responses[0].outputModalities, ["text"]);

    await session.emit({
      type: "response.created",
      responseId: "resp_chain_2",
      metadata: session.responses[0].metadata,
      rawEvent: {},
    });
    await session.emit({
      type: "tool.call",
      responseId: "resp_chain_2",
      call: {
        id: "item_chain_2",
        callId: "call_chain_2",
        name: "chain_widget",
        arguments: "{}",
      },
      rawEvent: {},
    });
    await session.emit({
      type: "response.done",
      responseId: "resp_chain_2",
      status: "completed",
      rawEvent: {},
    });

    assert.equal(session.responses.length, 2);
    assert.deepEqual(session.responses[1].outputModalities, ["text"]);
    assert.equal(session.responses[1].instructions, "Stay text-only");
    assert.equal(session.responses[1].maxOutputTokens, 32);
    assert.equal(session.responses[1].metadata?.turn, "chain");
    assert.equal(session.responses[1].tools?.length, 1);
  });

  it("does not create a follow-up response for cancelled tool turns", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);
    const deferredTool = createDeferred<ToolHandlerResult>();
    assistant.tools = [
      {
        name: "slow_widget",
        parameters: { type: "object" },
        handler: async () => deferredTool.promise,
      },
    ];

    await assistant.setRealtimeVoiceEnabled(true);
    const session = model.sessions[0];

    const toolCall = session.emit({
      type: "tool.call",
      responseId: "resp_cancelled_tool",
      call: {
        id: "item_cancelled_tool",
        callId: "call_cancelled_tool",
        name: "slow_widget",
        arguments: "{}",
      },
      rawEvent: {},
    });
    await waitForMicrotask();

    await session.emit({
      type: "response.done",
      responseId: "resp_cancelled_tool",
      status: "cancelled",
      rawEvent: {},
    });

    deferredTool.resolve({ success: true, data: { visible: true } });
    await toolCall;

    assert.equal(session.functionOutputs.length, 1);
    assert.equal(session.functionOutputs[0].callId, "call_cancelled_tool");
    assert.equal(session.functionOutputs[0].options?.createResponse, false);
    assert.equal(session.responses.length, 0);
  });

  it("sends text, audio, and triggered responses through the active session", async () => {
    const model = new FakeRealtimeModel();
    const assistant = new TestRealtimeAssistant(model);

    await assistant.sendRealtimeText("hello", { instructions: "reply" });
    await assistant.appendRealtimeAudio("base64-audio");
    await assistant.commitRealtimeAudio();
    await assistant.triggerRealtimeResponse("say hi");
    await assistant.triggerRealtimeResponse("interrupt", {
      cancelActiveResponse: true,
    });

    const session = model.sessions[0];
    assert.equal(session.texts[0].text, "hello");
    assert.equal(session.texts[0].options?.response?.instructions, "reply");
    assert.deepEqual(session.audioChunks, ["base64-audio"]);
    assert.equal(session.committed, 1);
    assert.equal(session.cancelled, 1);
    assert.equal(session.responses[0].instructions, "say hi");
    assert.equal(session.responses[1].instructions, "interrupt");
  });
});
