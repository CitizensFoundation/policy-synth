import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import type { ChatCompletionFunctionTool } from "openai/resources/chat/completions";
import { AgentExecutionStoppedError, PolicySynthAgent } from "./agent.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PsAgent } from "../dbModels/agent.js";

export enum AgentPhase {
  START,
  PLAN,
  CALL_TOOL,
  OBSERVE,
  FINISH,
}

export type ToolSpec = ChatCompletionFunctionTool;

export interface PolicySynthAgentTaskRunOptions {
  appendUserMessage?: boolean;
  yieldCommentary?: boolean;
  resetPhase?: boolean;
}

export interface PolicySynthAgentTaskModelCall {
  modelType: PsAiModelType;
  modelSize: PsAiModelSize;
  messages: PsModelMessage[];
  options: PsCallModelOptions;
}

export interface PolicySynthAgentTaskToolExecutionBatch {
  outputItems: PsResponseOutputItem[];
  parallelTools?: boolean;
}

export abstract class PolicySynthAgentTask extends PolicySynthAgent {
  protected readonly TOOLS: ToolSpec[] = [];

  protected readonly messages: PsModelMessage[] = [];
  protected pendingToolCalls: ToolCall[] = [];
  protected pendingOutputItems: PsResponseOutputItem[] = [];
  protected phase: AgentPhase = AgentPhase.START;

  readonly runDir: string;
  protected readonly ready: Promise<void>;
  protected readonly dirs: Record<
    "scratch" | "memory" | "artifacts" | "logs",
    string
  >;

  modelCallOptions: PsCallModelOptions = {};

  constructor(agent: PsAgent, memory: PsAgentMemoryData, taskId: string) {
    super(agent, memory, 0, 100);

    const here = path.dirname(fileURLToPath(import.meta.url));
    this.runDir = path.join(here, "agent_runs", taskId);
    this.dirs = {
      scratch: path.join(this.runDir, "scratch"),
      memory: path.join(this.runDir, "memory"),
      artifacts: path.join(this.runDir, "artifacts"),
      logs: path.join(this.runDir, "logs"),
    };
    this.ready = Promise.all(
      Object.values(this.dirs).map((d) => fsp.mkdir(d, { recursive: true }))
    ).then(() => undefined);

    this.setReasoningEffort(this.reasoningEffort);
  }

  setReasoningEffort(effort: PsReasoningEffort) {
    this.modelCallOptions.modelReasoningEffort = effort;
    if (this.modelManager) {
      this.modelManager.reasoningEffort = effort;
    }
  }

  async *run(
    userMessage: string,
    systemPrompt: string,
    appendUserMessage = true
  ): AsyncIterableIterator<PsModelMessage> {
    yield* this.runWithOptions(userMessage, systemPrompt, {
      appendUserMessage,
    });
  }

  async *runWithOptions(
    userMessage: string,
    systemPrompt: string,
    options: PolicySynthAgentTaskRunOptions = {}
  ): AsyncIterableIterator<PsModelMessage> {
    const {
      appendUserMessage = true,
      yieldCommentary = false,
      resetPhase = false,
    } = options;

    if (resetPhase) {
      this.resetLoopState();
    }

    this.setSystemPrompt(systemPrompt);
    if (appendUserMessage) {
      this.messages.push({ role: "user", message: userMessage });
    }

    let idx = this.messages.length;
    while (this.phase !== AgentPhase.FINISH) {
      this.throwIfTaskStopRequested();
      switch (this.phase) {
        case AgentPhase.START:
          this.phase = AgentPhase.PLAN;
          break;
        case AgentPhase.PLAN:
          await this.planningStart();
          await this.planStep();
          await this.planningEnd();
          break;
        case AgentPhase.CALL_TOOL:
          await this.callToolStep();
          break;
        case AgentPhase.OBSERVE:
          this.phase = this.isDone() ? AgentPhase.FINISH : AgentPhase.PLAN;
          break;
      }
      this.throwIfTaskStopRequested();
      while (idx < this.messages.length) {
        const message = this.messages[idx++];
        if (
          !yieldCommentary &&
          message.role === "assistant" &&
          message.phase === "commentary"
        ) {
          continue;
        }
        yield message;
      }
    }
  }

  protected abstract policy(): readonly string[];

  protected async planningStart(): Promise<void> {
    this.logger.info("Planning started");
    await this.onBeforePlanningStep();
  }
  protected async planningEnd(): Promise<void> {
    await this.onAfterPlanningStep();
    this.logger.info("Planning ended");
  }

  protected async onBeforePlanningStep(): Promise<void> {}

  protected async onAfterPlanningStep(): Promise<void> {}

  protected async onBeforeToolCall(): Promise<void> {}

  protected async onAfterToolCall(): Promise<void> {}

  public appendMessage(message: PsModelMessage): void {
    this.messages.push(message);
  }

  public appendMessages(messages: PsModelMessage[]): void {
    this.messages.push(...messages);
  }

  public clearMessages(): void {
    this.messages.length = 0;
  }

  protected setSystemPrompt(systemPrompt: string): void {
    const systemMessage: PsModelMessage = {
      role: "system",
      message: systemPrompt.trim(),
    };
    const existingSystemIndex = this.messages.findIndex(
      (message) => message.role === "system"
    );

    if (existingSystemIndex !== -1) {
      this.messages.splice(existingSystemIndex, 1);
    }

    for (let index = this.messages.length - 1; index >= 0; index--) {
      if (this.messages[index].role === "system") {
        this.messages.splice(index, 1);
      }
    }

    this.messages.unshift(systemMessage);
  }

  protected resetLoopState(): void {
    this.phase = AgentPhase.START;
    this.pendingToolCalls = [];
    this.pendingOutputItems = [];
  }

  protected isTaskStopRequested(): boolean {
    return false;
  }

  protected throwIfTaskStopRequested(
    message = "Agent task execution stopped"
  ): void {
    if (this.isTaskStopRequested()) {
      throw new AgentExecutionStoppedError(message);
    }
  }

  protected pruneMismatchedToolMessages(
    messages: PsModelMessage[] = this.messages
  ): void {
    const assistantToolCallIds = new Set<string>();
    const toolResponseIds = new Set<string>();

    for (const message of messages) {
      if (message.role === "assistant" && message.toolCall?.id) {
        assistantToolCallIds.add(message.toolCall.id);
      } else if (message.role === "tool" && message.toolCallId) {
        toolResponseIds.add(message.toolCallId);
      }
    }

    for (let index = messages.length - 1; index >= 0; index--) {
      const message = messages[index];
      if (
        message.role === "tool" &&
        (!message.toolCallId || !assistantToolCallIds.has(message.toolCallId))
      ) {
        messages.splice(index, 1);
        continue;
      }

      if (
        message.role === "assistant" &&
        message.toolCall?.id &&
        !toolResponseIds.has(message.toolCall.id)
      ) {
        messages.splice(index, 1);
      }
    }
  }

  protected resetTaskConversationState(): void {}

  protected isDone(): boolean {
    for (let index = this.messages.length - 1; index >= 0; index--) {
      const message = this.messages[index];
      if (message.role !== "assistant" || message.toolCall) {
        return false;
      }
      if (message.phase === "commentary") {
        continue;
      }
      return true;
    }

    return false;
  }

  protected async ensureRunDirs(): Promise<void> {
    await this.ready;
  }

  protected readonly fs = {
    mktemp: (
      bucket: keyof PolicySynthAgentTask["dirs"],
      prefix = "tmp",
      ext = ".txt"
    ) => {
      const ts = Date.now();
      const rnd = crypto.randomBytes(3).toString("hex");
      return path.join(this.dirs[bucket], `${prefix}-${ts}-${rnd}${ext}`);
    },

    writeText: async (
      bucket: keyof PolicySynthAgentTask["dirs"],
      rel: string,
      data: string
    ) => {
      await this.ensureRunDirs();
      const file = path.join(this.dirs[bucket], rel);
      await fsp.mkdir(path.dirname(file), { recursive: true });
      await fsp.writeFile(file, data, "utf8");
      return file;
    },

    readText: async (
      bucket: keyof PolicySynthAgentTask["dirs"],
      rel: string
    ) => {
      await this.ensureRunDirs();
      return fsp.readFile(path.join(this.dirs[bucket], rel), "utf8");
    },

    writeJSON: async (
      bucket: keyof PolicySynthAgentTask["dirs"],
      rel: string,
      obj: unknown,
      pretty = 2
    ) => {
      const txt = JSON.stringify(obj, null, pretty);
      return this.fs.writeText(bucket, rel, txt);
    },

    readJSON: async (
      bucket: keyof PolicySynthAgentTask["dirs"],
      rel: string
    ) => {
      const txt = await this.fs.readText(bucket, rel);
      return JSON.parse(txt);
    },

    list: async (bucket: keyof PolicySynthAgentTask["dirs"], rel = "") => {
      await this.ensureRunDirs();
      const dir = path.join(this.dirs[bucket], rel);
      return fsp.readdir(dir, { withFileTypes: true });
    },
  };

  protected async planStep(): Promise<void> {
    const allow = new Set(this.policy());
    const modelType = PsAiModelType.TextReasoning;
    const modelSize = PsAiModelSize.Large;
    const options: PsCallModelOptions = {
      parseJson: false,
      useOpenAiResponsesIfOpenAi: true,
      useThoughtSignatures: true,
      returnBaseModelResult: true,
      functions: this.TOOLS,
      toolChoice: "auto",
      allowedTools: [...allow],
      ...this.modelCallOptions,
    };

    const result = await this.callTaskModel(
      modelType,
      modelSize,
      this.messages,
      options
    );

    const text =
      typeof result === "string"
        ? result
        : result && typeof result === "object" && "content" in result
          ? String(result.content ?? "")
          : JSON.stringify(result);
    const assistantPhase =
      result && typeof result === "object" && "phase" in result
        ? (result.phase as PsAssistantMessagePhase | undefined)
        : undefined;
    const hasAssistantMessage =
      text.length > 0 || assistantPhase !== undefined;
    const assistantMessages =
      result &&
      typeof result === "object" &&
      "assistantMessages" in result &&
      Array.isArray(result.assistantMessages)
        ? (result.assistantMessages as PsAssistantResponseMessage[]).filter(
            (message) => message.content.length > 0 || message.phase !== undefined
          )
        : hasAssistantMessage
          ? [{ content: text, phase: assistantPhase }]
          : [];

    if (
      result &&
      typeof result === "object" &&
      "toolCalls" in result &&
      Array.isArray(result.toolCalls) &&
      result.toolCalls.length
    ) {
      const orderedOutputItems =
        result &&
        typeof result === "object" &&
        "orderedOutputItems" in result &&
        Array.isArray(result.orderedOutputItems)
          ? (result.orderedOutputItems as PsResponseOutputItem[])
          : undefined;

      this.pendingOutputItems =
        orderedOutputItems?.filter(
          (item) => {
            if (item.type === "tool_call") {
              return true;
            }

            return item.message.phase === "commentary";
          }
        ) ??
        [
          ...assistantMessages
            .filter((message) => message.phase === "commentary")
            .map(
              (message) =>
                ({
                  type: "assistant_message",
                  message,
                }) satisfies PsResponseOutputItem
            ),
          ...(result.toolCalls as ToolCall[]).map(
            (toolCall) =>
              ({
                type: "tool_call",
                toolCall,
              }) satisfies PsResponseOutputItem
          ),
        ];

      // Defer emitting assistant tool_call messages until callToolStep,
      // so we can interleave each assistant(tool_call) with its tool response.
      this.pendingToolCalls = this.pendingOutputItems
        .filter(
          (item): item is Extract<PsResponseOutputItem, { type: "tool_call" }> =>
            item.type === "tool_call"
        )
        .map((item) => item.toolCall);
      this.phase = AgentPhase.CALL_TOOL;
    } else {
      this.pendingOutputItems = [];
      const finalizedAssistantMessages =
        assistantPhase === "commentary" && assistantMessages.length > 0
          ? assistantMessages
          : [{ content: text, phase: assistantPhase }];
      for (const assistantMessage of finalizedAssistantMessages) {
        this.messages.push({
          role: "assistant",
          message: assistantMessage.content,
          phase: assistantMessage.phase,
        });
      }
      this.phase = AgentPhase.OBSERVE;
    }
  }

  protected async callToolStep(): Promise<void> {
    const outputItems = this.getPendingOutputItems();
    this.pendingToolCalls = [];
    this.pendingOutputItems = [];
    const shouldRunHooks =
      this.callToolStep === PolicySynthAgentTask.prototype.callToolStep;

    if (shouldRunHooks) {
      await this.onBeforeToolCall();
    }

    try {
      const batches = this.partitionToolOutputItemsForExecution(outputItems);
      for (const batch of batches) {
        if (batch.outputItems.length === 0) {
          continue;
        }

        await this.appendToolExecutionOutputItems(batch.outputItems, {
          parallelTools:
            batch.parallelTools ??
            this.shouldRunToolsInParallel(batch.outputItems),
        });
      }

      this.phase = AgentPhase.OBSERVE;
    } finally {
      if (shouldRunHooks) {
        await this.onAfterToolCall();
      }
    }
  }

  protected async callTaskModel(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ): Promise<unknown> {
    let call: PolicySynthAgentTaskModelCall = {
      modelType,
      modelSize,
      messages,
      options,
    };
    let stopPolling = false;

    try {
      call = await this.prepareModelCall(
        call.modelType,
        call.modelSize,
        call.messages,
        call.options
      );

      const intervalMs = this.getModelCallStopCheckIntervalMs();
      const shouldPollForStop =
        typeof intervalMs === "number" &&
        Number.isFinite(intervalMs) &&
        intervalMs > 0;
      const modelCall = this.callModel(
        call.modelType,
        call.modelSize,
        call.messages,
        call.options
      );
      const result = shouldPollForStop
        ? await Promise.race([
            modelCall,
            this.pollForModelCallStopRequest(intervalMs, () => stopPolling),
          ])
        : await modelCall;

      await this.afterModelCall(call, result);
      return result;
    } catch (error) {
      return this.onModelCallError(call, error);
    } finally {
      stopPolling = true;
    }
  }

  protected async prepareModelCall(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ): Promise<PolicySynthAgentTaskModelCall> {
    return {
      modelType,
      modelSize,
      messages,
      options,
    };
  }

  protected async afterModelCall(
    _call: PolicySynthAgentTaskModelCall,
    _result: unknown
  ): Promise<void> {}

  protected async onModelCallError(
    _call: PolicySynthAgentTaskModelCall,
    error: unknown
  ): Promise<never> {
    throw error;
  }

  protected getModelCallStopCheckIntervalMs(): number | undefined {
    return undefined;
  }

  private async pollForModelCallStopRequest(
    intervalMs: number,
    shouldStopPolling: () => boolean
  ): Promise<never> {
    while (!shouldStopPolling()) {
      if (this.isTaskStopRequested()) {
        throw new AgentExecutionStoppedError(
          "Agent task execution stopped during model call"
        );
      }

      await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
    }

    return new Promise<never>(() => {});
  }

  protected getPendingOutputItems(): PsResponseOutputItem[] {
    return this.pendingOutputItems.length > 0
      ? this.pendingOutputItems
      : this.pendingToolCalls.map(
          (toolCall) =>
            ({
              type: "tool_call",
              toolCall,
            }) satisfies PsResponseOutputItem
        );
  }

  protected shouldRunToolsInParallel(
    _outputItems: PsResponseOutputItem[]
  ): boolean {
    return true;
  }

  protected partitionToolOutputItemsForExecution(
    outputItems: PsResponseOutputItem[]
  ): PolicySynthAgentTaskToolExecutionBatch[] {
    return [
      {
        outputItems,
        parallelTools: this.shouldRunToolsInParallel(outputItems),
      },
    ];
  }

  protected async appendToolExecutionOutputItems(
    outputItems: PsResponseOutputItem[],
    options: { parallelTools?: boolean } = {}
  ): Promise<void> {
    const allow = new Set(this.policy());
    const parallelTools = options.parallelTools ?? true;

    const toolResults = parallelTools
      ? await Promise.all(
          outputItems.map((item) =>
            item.type === "tool_call"
              ? this.executeToolCallWithPolicy(item.toolCall, allow)
              : Promise.resolve(undefined)
          )
        )
      : [];

    for (const [index, outputItem] of outputItems.entries()) {
      if (outputItem.type === "assistant_message") {
        this.messages.push({
          role: "assistant",
          message: outputItem.message.content,
          phase: outputItem.message.phase,
        });
        continue;
      }

      const call = outputItem.toolCall;
      const toolMessage =
        toolResults[index] ??
        (await this.executeToolCallWithPolicy(call, allow));
      this.messages.push({ role: "assistant", message: "", toolCall: call });
      this.messages.push(toolMessage);
    }
  }

  protected async executeToolCallWithPolicy(
    call: ToolCall,
    allow: Set<string>
  ): Promise<PsModelMessage> {
    if (!allow.has(call.name)) {
      this.logger.error(
        `Policy violation: attempted to call disallowed tool ${call.name}`
      );
      return {
        role: "tool",
        name: call.name,
        message: `Tool ${call.name} is not allowed by policy`,
        toolCallId: call.id,
      };
    }

    const result = await this.runTool(call.name, call.arguments);
    return {
      role: "tool",
      name: call.name,
      message: result,
      toolCallId: call.id,
    };
  }

  protected async runTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<string> {
    const artefact = await this.fs.writeJSON("artifacts", `${name}.json`, args);
    return `stored artefact at ${artefact}`;
  }
}
