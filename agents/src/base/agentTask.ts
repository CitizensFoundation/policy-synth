import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import type { ChatCompletionTool } from "openai/resources/chat/completions";
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

export type ToolSpec = ChatCompletionTool;

export abstract class PolicySynthAgentTask extends PolicySynthAgent {
  protected readonly TOOLS: ToolSpec[] = [];

  protected readonly messages: PsModelMessage[] = [];
  private pendingToolCalls: ToolCall[] = [];
  protected phase: AgentPhase = AgentPhase.START;

  readonly runDir: string;
  private readonly dirs: Record<
    "scratch" | "memory" | "artifacts" | "logs",
    string
  >;

  modelCallOptions: PsCallModelOptions = {};

  constructor(
    agent: PsAgent,
    memory: PsAgentMemoryData,
    taskId: string
  ) {
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
  }

  async *run(userMessage: string, systemPrompt: string): AsyncIterableIterator<PsModelMessage> {
    this.messages.push({ role: "system", message: systemPrompt.trim() });
    this.messages.push({ role: "user", message: userMessage });

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
      yield this.messages.at(-1)!;
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
    const last = this.messages.at(-1);
    return !!last && last.role === "assistant" && !last.toolCall;
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

  private async planStep(): Promise<void> {
    const allow = new Set(this.policy());

    const result = await this.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Large,
      this.messages,
      {
        parseJson: false,
        functions: this.TOOLS,
        toolChoice: "auto",
        allowedTools: [...allow],
        ...this.modelCallOptions
      }
    );

    let assistantMsg: PsModelMessage;
    if (
      result &&
      typeof result === "object" &&
      Array.isArray(result.toolCalls) &&
      result.toolCalls.length
    ) {
      const [first, ...rest] = result.toolCalls as ToolCall[];
      this.pendingToolCalls = rest;
      assistantMsg = { role: "assistant", message: "", toolCall: first };
    } else {
      const text = typeof result === "string" ? result : JSON.stringify(result);
      assistantMsg = { role: "assistant", message: text };
    }

    this.messages.push(assistantMsg);
    this.phase = assistantMsg.toolCall
      ? AgentPhase.CALL_TOOL
      : AgentPhase.OBSERVE;
  }

  private async callToolStep(): Promise<void> {
    const call = this.messages.at(-1)!.toolCall!;
    const allow = new Set(this.policy());
    if (!allow.has(call.name)) {
      this.logger.error(
        `Policy violation: attempted to call disallowed tool ${call.name}`
      );
      const msg = `Tool ${call.name} is not allowed by policy`;
      this.messages.push({
        role: "tool",
        name: call.name,
        message: msg,
        toolCallId: call.id,
      });
      this.phase = AgentPhase.OBSERVE;
      return;
    }

    const result = await this.runTool(call.name, call.arguments);
    this.messages.push({
      role: "tool",
      name: call.name,
      message: result,
      toolCallId: call.id,
    });
    if (this.pendingToolCalls.length) {
      const next = this.pendingToolCalls.shift()!;
      this.messages.push({ role: "assistant", message: "", toolCall: next });
      this.phase = AgentPhase.CALL_TOOL;
    } else {
      this.phase = AgentPhase.OBSERVE;
    }
  }

  protected async runTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<string> {
    const artefact = await this.fs.writeJSON("artifacts", `${name}.json`, args);
    return `stored artefact at ${artefact}`;
  }
}
