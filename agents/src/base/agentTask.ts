import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import type { ChatCompletionFunctionTool, ChatCompletionTool } from "openai/resources/chat/completions";
import { PolicySynthAgent } from "./agent.js";
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

export abstract class PolicySynthAgentTask extends PolicySynthAgent {
  protected readonly TOOLS: ToolSpec[] = [];

  protected readonly messages: PsModelMessage[] = [];
  protected pendingToolCalls: ToolCall[] = [];
  protected pendingOutputItems: PsResponseOutputItem[] = [];
  protected phase: AgentPhase = AgentPhase.START;

  readonly runDir: string;
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
    Promise.all(
      Object.values(this.dirs).map((d) => fsp.mkdir(d, { recursive: true }))
    );

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
    systemPrompt: string
  ): AsyncIterableIterator<PsModelMessage> {
    this.messages.push({ role: "system", message: systemPrompt.trim() });
    this.messages.push({ role: "user", message: userMessage });

    let idx = this.messages.length;
    while (this.phase !== AgentPhase.FINISH) {
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
      while (idx < this.messages.length) {
        const message = this.messages[idx++];
        if (message.role === "assistant" && message.phase === "commentary") {
          continue;
        }
        yield message;
      }
    }
  }

  protected abstract policy(): readonly string[];

  protected async planningStart(): Promise<void> {
    this.logger.info("Planning started");
  }
  protected async planningEnd(): Promise<void> {
    this.logger.info("Planning ended");
  }

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
      const file = path.join(this.dirs[bucket], rel);
      await fsp.mkdir(path.dirname(file), { recursive: true });
      await fsp.writeFile(file, data, "utf8");
      return file;
    },

    readText: async (
      bucket: keyof PolicySynthAgentTask["dirs"],
      rel: string
    ) => {
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
      const dir = path.join(this.dirs[bucket], rel);
      return fsp.readdir(dir, { withFileTypes: true });
    },
  };

  protected async planStep(): Promise<void> {
    const allow = new Set(this.policy());

    const result = await this.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Large,
      this.messages,
      {
        parseJson: false,
        useOpenAiResponsesIfOpenAi: true,
        useThoughtSignatures: true,
        returnBaseModelResult: true,
        functions: this.TOOLS,
        toolChoice: "auto",
        allowedTools: [...allow],
        ...this.modelCallOptions,
      }
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
    const outputItems =
      this.pendingOutputItems.length > 0
        ? this.pendingOutputItems
        : this.pendingToolCalls.map(
            (toolCall) =>
              ({
                type: "tool_call",
                toolCall,
              }) satisfies PsResponseOutputItem
          );
    const calls = outputItems
      .filter(
        (item): item is Extract<PsResponseOutputItem, { type: "tool_call" }> =>
          item.type === "tool_call"
      )
      .map((item) => item.toolCall);
    this.pendingToolCalls = [];
    this.pendingOutputItems = [];
    const allow = new Set(this.policy());

    // Run all tools in parallel to keep performance
    const toolResults = await Promise.all(
      calls.map(async (call) => {
        if (!allow.has(call.name)) {
          this.logger.error(
            `Policy violation: attempted to call disallowed tool ${call.name}`
          );
          const msg = `Tool ${call.name} is not allowed by policy`;
          return {
            role: "tool" as const,
            name: call.name,
            message: msg,
            toolCallId: call.id,
          };
        }

        const result = await this.runTool(call.name, call.arguments);
        return {
          role: "tool" as const,
          name: call.name,
          message: result,
          toolCallId: call.id,
        };
      })
    );

    for (const outputItem of outputItems) {
      if (outputItem.type === "assistant_message") {
        this.messages.push({
          role: "assistant",
          message: outputItem.message.content,
          phase: outputItem.message.phase,
        });
        continue;
      }

      const call = outputItem.toolCall;
      this.messages.push({ role: "assistant", message: "", toolCall: call });
      const toolMsg = toolResults.find((m) => m.toolCallId === call.id);
      this.messages.push(
        toolMsg ?? {
          role: "tool" as const,
          name: call.name,
          message: `No tool result available for call id ${call.id}`,
          toolCallId: call.id,
        }
      );
    }

    this.phase = AgentPhase.OBSERVE;
  }

  protected async runTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<string> {
    const artefact = await this.fs.writeJSON("artifacts", `${name}.json`, args);
    return `stored artefact at ${artefact}`;
  }
}
