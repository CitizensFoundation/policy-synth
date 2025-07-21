import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import OpenAI from "openai";

import type {
  ChatCompletionTool,
  ChatCompletionMessageParam,
  ChatCompletionMessage,
} from "openai/resources/chat/completions";

import { encoding_for_model as encodingForModel } from "tiktoken";
import {
  GoogleGenerativeAI,
  FunctionCallingConfig,
  Content,
  FunctionDeclaration,
} from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { PolicySynthAgentBase } from "./agentBase";

export enum AgentPhase {
  START,
  PLAN,
  CALL_TOOL,
  OBSERVE,
  FINISH,
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  name?: string; // present on role === "tool"
  toolCall?: { name: string; arguments: Record<string, unknown> };
}

export type ToolSpec = ChatCompletionTool; // conforms to OpenAI schema

////////////////////////////////////////////////////////////////////////////////
// Provider-specific types (discriminated unions)
////////////////////////////////////////////////////////////////////////////////

// Discriminated union for provider responses
type ProviderResponse =
  | { provider: "openai"; response: OpenAI.Chat.ChatCompletion }
  | { provider: "gemini"; response: GeminiResponse }
  | { provider: "anthropic"; response: AnthropicResponse };

// Provider-specific response types
interface GeminiResponse {
  functionCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  text?: string;
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    name?: string;
    input?: Record<string, unknown>;
    text?: string;
  }>;
}

////////////////////////////////////////////////////////////////////////////////
// Type Guards for safe type narrowing
////////////////////////////////////////////////////////////////////////////////

function isOpenAIResponse(
  response: ProviderResponse
): response is Extract<ProviderResponse, { provider: "openai" }> {
  return response.provider === "openai";
}

function isGeminiResponse(
  response: ProviderResponse
): response is Extract<ProviderResponse, { provider: "gemini" }> {
  return response.provider === "gemini";
}

function isAnthropicResponse(
  response: ProviderResponse
): response is Extract<ProviderResponse, { provider: "anthropic" }> {
  return response.provider === "anthropic";
}

function hasValidStructure<T extends Record<string, unknown>>(
  obj: unknown,
  requiredFields: Array<keyof T>
): obj is T {
  return (
    typeof obj === "object" &&
    obj !== null &&
    requiredFields.every((field) => field in obj)
  );
}

function safeParseJSON(jsonString: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

export abstract class PolicySynthAgentTask extends PolicySynthAgentBase {
  /* ─────────────────────  STATIC CONFIG  ───────────────────── */
  /** Stable, provider‑agnostic list of tools (OpenAPI schema). */
  protected static readonly TOOLS: ToolSpec[] = [];

  /* ─────────────────────  RUNTIME STATE  ───────────────────── */
  protected readonly messages: ChatMessage[] = []; // append‑only ***
  protected phase: AgentPhase = AgentPhase.START;

  /* ─────────────────────  PROVIDER GLUE  ───────────────────── */
  private readonly provider: "openai" | "gemini" | "anthropic";
  private readonly modelName: string;
  /* c8 ignore next 3 */
  private readonly openai?: OpenAI;
  private readonly gemini?: GoogleGenerativeAI;
  private readonly anthropic?: Anthropic;
  private readonly encoder: ReturnType<typeof encodingForModel> | undefined;

  /* ─────────────────────  FILE‑SYSTEM CONTEXT  ──────────────── */
  readonly runDir: string;
  private readonly dirs: Record<
    "scratch" | "memory" | "artifacts" | "logs",
    string
  >;

  constructor(
    provider: "openai" | "gemini" | "anthropic",
    public readonly taskId: string,
    public readonly systemPrompt: string,
    private readonly modelOpts: Record<string, unknown> = {}
  ) {
    super();
    this.provider = provider;
    switch (provider) {
      case "openai":
        this.modelName = (modelOpts.model as string) || "o3";
        this.openai = new OpenAI(modelOpts);
        this.encoder = encodingForModel(
          this.modelName as unknown as Parameters<typeof encodingForModel>[0]
        );
        break;
      case "gemini":
        this.modelName = (modelOpts.model as string) || "gemini-2.5-pro";
        // GoogleGenerativeAI constructor takes the API key string directly.
        this.gemini = new GoogleGenerativeAI(
          (modelOpts.apiKey as string) ?? process.env.GEMINI_API_KEY ?? ""
        );
        break;
      case "anthropic":
        this.modelName = "claude-3-7-sonnet";
        this.anthropic = new Anthropic(modelOpts);
        break;
    }

    /* ── prepare the structured run directory ── */
    const here = path.dirname(fileURLToPath(import.meta.url));
    this.runDir = path.join(here, "agent_runs", taskId);
    this.dirs = {
      scratch: path.join(this.runDir, "scratch"), // volatile tmp
      memory: path.join(this.runDir, "memory"), // long‑term notes
      artifacts: path.join(this.runDir, "artifacts"), // externally useful
      logs: path.join(this.runDir, "logs"), // execution logs
    };
    Promise.all(
      Object.values(this.dirs).map((d) => fsp.mkdir(d, { recursive: true }))
    ).catch(() => {
      this.logger.error("Failed to create run directory");
    });
  }

  async *run(userMessage: string): AsyncIterableIterator<ChatMessage> {
    this.messages.push({ role: "system", content: this.systemPrompt.trim() });
    this.messages.push({ role: "user", content: userMessage });

    while (this.phase !== AgentPhase.FINISH) {
      switch (this.phase) {
        case AgentPhase.START:
          this.phase = AgentPhase.PLAN;
          break;
        case AgentPhase.PLAN:
          await this.planStep();
          break;
        case AgentPhase.CALL_TOOL:
          await this.callToolStep();
          break;
        case AgentPhase.OBSERVE:
          this.phase = this.isDone() ? AgentPhase.FINISH : AgentPhase.PLAN;
          break;
      }
      yield this.messages.at(-1)!; // stream last event to caller
    }
  }

  protected abstract policy(): readonly string[];

  protected isDone(): boolean {
    const last = this.messages.at(-1);
    return !!last && last.role === "assistant" && !last.toolCall;
  }

  ////////////////////////////////////////////////////////////////////////////
  // FILE‑SYSTEM HELPERS  (agent may reference these via `this.fs`)
  ////////////////////////////////////////////////////////////////////////////

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
      return file; // useful to embed in trace
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

  ////////////////////////////////////////////////////////////////////////////
  // INTERNALS – planning, tool execution, provider adapters
  ////////////////////////////////////////////////////////////////////////////
  private async planStep(): Promise<void> {
    const allow = new Set(this.policy());

    /* ─────────────────────  1. Ask provider for next action ────────── */
    const assistantMsg = await this.invokeProvider(allow);
    this.messages.push(assistantMsg);

    this.phase = assistantMsg.toolCall
      ? AgentPhase.CALL_TOOL
      : AgentPhase.OBSERVE;
  }

  /* ─────────────────────  2. Actually run the tool  ───────────────────── */
  private async callToolStep(): Promise<void> {
    const call = this.messages.at(-1)!.toolCall!;
    const result = await this.runTool(call.name, call.arguments);

    this.messages.push({ role: "tool", name: call.name, content: result });
    this.phase = AgentPhase.OBSERVE;
  }

  /* default dummy implementation; subclasses may override */
  protected async runTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<string> {
    const artefact = await this.fs.writeJSON("artifacts", `${name}.json`, args);
    return `stored artefact at ${artefact}`;
  }

  ////////////////////////////////////////////////////////////////////////////
  // Provider adaptor (unified entry) – safe type handling
  ////////////////////////////////////////////////////////////////////////////
  private async invokeProvider(allow: Set<string>): Promise<ChatMessage> {
    const providerResponse = await this.callProviderAPI(allow);
    return this.convertProviderResponse(providerResponse);
  }

  private async callProviderAPI(allow: Set<string>): Promise<ProviderResponse> {
    const messages = this.marshallMessages();

    switch (this.provider) {
      case "openai": {
        if (!this.openai) throw new Error("OpenAI client not initialized");

        const bias: Record<number, number> = {};
        for (const t of (this.constructor as typeof PolicySynthAgentTask)
          .TOOLS) {
          const name = t.type === "function" ? t.function.name : "";
          if (!allow.has(name)) {
            const tok = this.encoder!.encode(`"${name}"`)[0];
            bias[tok] = -100;
          }
        }

        const response = await this.openai.chat.completions.create({
          model: this.modelName,
          messages: messages as ChatCompletionMessageParam[],
          tools: [...(this.constructor as typeof PolicySynthAgentTask).TOOLS],
          tool_choice: "auto",
          logit_bias: bias,
          ...this.modelOpts,
        });

        return { provider: "openai", response };
      }

      case "gemini": {
        if (!this.gemini) throw new Error("Gemini client not initialized");

        const model = this.gemini.getGenerativeModel({
          model: this.modelName,
          tools: [
            {
              functionDeclarations: (
                this.constructor as typeof PolicySynthAgentTask
              ).TOOLS.map(
                (tool) =>
                  ({
                    name: tool.function.name,
                    description: tool.function.description,
                    parameters: tool.function.parameters,
                  } as FunctionDeclaration)
              ),
            },
          ],
          toolConfig: {
            functionCallingConfig: {
              mode: "AUTO",
              allowedFunctionNames: [...allow],
            } as FunctionCallingConfig,
          },
        });

        const chat = model.startChat({ history: messages as Content[] });
        const result = await chat.sendMessage("");
        const response = result.response;

        const geminiResp: GeminiResponse = {
          functionCalls: response.functionCalls()?.map((call) => ({
            name: call.name,
            args: (call.args || {}) as Record<string, unknown>,
          })),
          text: response.text(),
        };

        return { provider: "gemini", response: geminiResp };
      }

      case "anthropic": {
        if (!this.anthropic)
          throw new Error("Anthropic client not initialized");

        const response = await this.anthropic.messages.create({
          model: this.modelName,
          max_tokens: 1024,
          messages: messages as Anthropic.Messages.MessageParam[],
          tools: (this.constructor as typeof PolicySynthAgentTask).TOOLS.filter(
            (tool) => tool.function.parameters
          ) // Only include tools with parameters
            .map((tool) => ({
              name: tool.function.name,
              description: tool.function.description || "",
              input_schema: {
                type: "object",
                ...tool.function.parameters!,
              } as any,
            })),
          tool_choice: { type: "any" },
          ...this.modelOpts,
        });

        return {
          provider: "anthropic",
          response: response as AnthropicResponse,
        };
      }

      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private convertProviderResponse(response: ProviderResponse): ChatMessage {
    if (isOpenAIResponse(response)) {
      const choice = response.response.choices[0].message;
      return choice.tool_calls?.length
        ? {
            role: "assistant",
            toolCall: {
              name: choice.tool_calls[0].function.name,
              arguments: safeParseJSON(
                choice.tool_calls[0].function.arguments || "{}"
              ),
            },
          }
        : { role: "assistant", content: choice.content ?? "" };
    }

    if (isGeminiResponse(response)) {
      const geminiResp = response.response;
      return geminiResp.functionCalls?.length
        ? {
            role: "assistant",
            toolCall: {
              name: geminiResp.functionCalls[0].name,
              arguments: geminiResp.functionCalls[0].args,
            },
          }
        : { role: "assistant", content: geminiResp.text ?? "" };
    }

    if (isAnthropicResponse(response)) {
      const block = response.response.content[0];
      return block.type === "tool_use"
        ? {
            role: "assistant",
            toolCall: {
              name: block.name ?? "unknown",
              arguments: block.input ?? {},
            },
          }
        : { role: "assistant", content: block.text ?? "" };
    }

    throw new Error("Unknown provider response type");
  }

  ////////////////////////////////////////////////////////////////////////////
  // Message marshalling (type-safe conversion)
  ////////////////////////////////////////////////////////////////////////////
  private marshallMessages():
    | ChatCompletionMessageParam[]
    | Content[]
    | Anthropic.Messages.MessageParam[] {
    switch (this.provider) {
      case "openai":
        return this.messages.map((msg) => this.convertToOpenAIMessage(msg));
      case "gemini":
        return this.messages.map((msg) => this.convertToGeminiMessage(msg));
      case "anthropic":
        return this.messages.map((msg) => this.convertToAnthropicMessage(msg));
    }
  }

  private convertToOpenAIMessage(msg: ChatMessage): ChatCompletionMessageParam {
    if (msg.role === "tool") {
      return {
        role: "tool" as const,
        content: msg.content || "",
        tool_call_id: msg.name ?? "tool",
      };
    }

    if (msg.role === "assistant" && msg.toolCall) {
      return {
        role: "assistant" as const,
        tool_calls: [
          {
            id: crypto.randomUUID(),
            type: "function" as const,
            function: {
              name: msg.toolCall.name,
              arguments: JSON.stringify(msg.toolCall.arguments),
            },
          },
        ],
      };
    }

    return {
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content || "",
    };
  }

  private convertToGeminiMessage(msg: ChatMessage): Content {
    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content ?? "" }],
    };
  }

  private convertToAnthropicMessage(
    msg: ChatMessage
  ): Anthropic.Messages.MessageParam {
    if (msg.role === "assistant" && msg.toolCall) {
      return {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: crypto.randomUUID(),
            name: msg.toolCall.name,
            input: msg.toolCall.arguments,
          },
        ],
      };
    }

    if (msg.role === "tool") {
      return {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: msg.name ?? "tool",
            content: msg.content || "",
          },
        ],
      };
    }

    return {
      role: msg.role as "user" | "assistant",
      content: msg.content || "",
    };
  }

  protected countOpenAIPromptTokens(): number {
    if (!this.encoder) return 0;
    return this.messages.reduce(
      (sum, m) => sum + this.encoder!.encode(m.content ?? "").length,
      0
    );
  }
}
