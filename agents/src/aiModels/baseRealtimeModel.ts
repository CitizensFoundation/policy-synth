import { PolicySynthAgentBase } from "../base/agentBase.js";
import type { PsAssistantTool, PsAssistantToolCall } from "../base/assistantTools.js";

export type PsRealtimeAudioFormat = "pcm16" | "g711_ulaw" | "g711_alaw";
export type PsRealtimeOutputModality = "text" | "audio";
export type PsRealtimeReasoningEffort =
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh";

export type PsRealtimeToolChoice =
  | "auto"
  | "none"
  | "required"
  | {
      type: "function";
      name: string;
    };

export interface PsRealtimeInputAudioTranscription {
  model?: string;
  language?: string;
  prompt?: string;
  delay?: "minimal" | "low" | "medium" | "high" | "xhigh";
}

export type PsRealtimeTurnDetection =
  | {
      type: "server_vad";
      threshold?: number;
      prefixPaddingMs?: number;
      silenceDurationMs?: number;
      createResponse?: boolean;
      interruptResponse?: boolean;
      idleTimeoutMs?: number | null;
    }
  | {
      type: "semantic_vad";
      eagerness?: "low" | "medium" | "high" | "auto";
      createResponse?: boolean;
      interruptResponse?: boolean;
    }
  | null;

export interface PsRealtimeSessionOptions {
  model?: string;
  instructions?: string;
  voice?: string;
  outputModalities?: PsRealtimeOutputModality[];
  inputAudioFormat?: PsRealtimeAudioFormat;
  outputAudioFormat?: PsRealtimeAudioFormat;
  inputAudioTranscription?: PsRealtimeInputAudioTranscription | null;
  turnDetection?: PsRealtimeTurnDetection;
  reasoningEffort?: PsRealtimeReasoningEffort;
  parallelToolCalls?: boolean;
  maxOutputTokens?: number | "inf";
  tools?: PsAssistantTool[];
  toolChoice?: PsRealtimeToolChoice;
  tracing?: "auto" | null | Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface PsRealtimeCreateResponseOptions {
  instructions?: string;
  outputModalities?: PsRealtimeOutputModality[];
  tools?: PsAssistantTool[];
  toolChoice?: PsRealtimeToolChoice;
  reasoningEffort?: PsRealtimeReasoningEffort;
  parallelToolCalls?: boolean;
  maxOutputTokens?: number | "inf";
  metadata?: Record<string, string>;
}

export interface PsRealtimeSendTextOptions {
  createResponse?: boolean;
  response?: PsRealtimeCreateResponseOptions;
}

export interface PsRealtimeFunctionOutputOptions {
  createResponse?: boolean;
  response?: PsRealtimeCreateResponseOptions;
}

export interface PsRealtimeUsage {
  tokensIn?: number;
  tokensOut?: number;
  totalTokens?: number;
  cachedInTokens?: number;
  audioInputTokens?: number;
  audioOutputTokens?: number;
  textInputTokens?: number;
  textOutputTokens?: number;
  imageInputTokens?: number;
}

export type PsRealtimeSessionEvent =
  | {
      type: "session.created";
      sessionId?: string;
      rawEvent: unknown;
    }
  | {
      type: "session.updated";
      sessionId?: string;
      rawEvent: unknown;
    }
  | {
      type: "audio.delta";
      delta: string;
      responseId?: string;
      itemId?: string;
      rawEvent: unknown;
    }
  | {
      type: "text.delta";
      delta: string;
      responseId?: string;
      itemId?: string;
      rawEvent: unknown;
    }
  | {
      type: "input.transcript.done";
      transcript: string;
      itemId?: string;
      rawEvent: unknown;
    }
  | {
      type: "assistant.transcript.done";
      transcript: string;
      responseId?: string;
      itemId?: string;
      rawEvent: unknown;
    }
  | {
      type: "response.created";
      responseId?: string;
      metadata?: Record<string, string> | null;
      rawEvent: unknown;
    }
  | {
      type: "response.done";
      responseId?: string;
      status?: string;
      usage?: PsRealtimeUsage;
      rawEvent: unknown;
    }
  | {
      type: "tool.call";
      call: PsAssistantToolCall;
      responseId?: string;
      rawEvent: unknown;
    }
  | {
      type: "error";
      message: string;
      code?: string | null;
      rawEvent: unknown;
    }
  | {
      type: "closed";
      code?: number;
      reason?: string;
      rawEvent?: unknown;
    };

export type PsRealtimeSessionEventHandler = (
  event: PsRealtimeSessionEvent
) => void | Promise<void>;

export interface PsRealtimeSession {
  readonly id?: string;
  connect(): Promise<void>;
  update(options: PsRealtimeSessionOptions): Promise<void>;
  sendText(text: string, options?: PsRealtimeSendTextOptions): Promise<void>;
  appendAudio(audio: Uint8Array | string): Promise<void>;
  commitAudio(): Promise<void>;
  cancelResponse(responseId?: string): Promise<void>;
  createResponse(options?: PsRealtimeCreateResponseOptions): Promise<void>;
  sendFunctionOutput(
    callId: string,
    output: string,
    options?: PsRealtimeFunctionOutputOptions
  ): Promise<void>;
  close(): Promise<void>;
  onEvent(listener: PsRealtimeSessionEventHandler): () => void;
}

export abstract class BaseRealtimeModel extends PolicySynthAgentBase {
  modelName: string;
  apiModelName?: string;
  provider?: string;
  config: PsAiModelConfig;
  dbModelId?: number;

  constructor(config: PsAiModelConfig, modelName: string) {
    super();
    this.config = config;
    this.modelName = modelName;
    this.apiModelName = config.apiModelName;
  }

  protected getApiModelName(): string {
    return this.apiModelName ?? this.modelName;
  }

  getCloneConfig(): PsAiModelConfig {
    return { ...this.config };
  }

  abstract createSession(
    options?: PsRealtimeSessionOptions
  ): Promise<PsRealtimeSession>;
}
