import type { GenerateContentResponse } from "@google/genai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import { GoogleGeminiChat } from "./googleGeminiChat.js";

export class GoogleGeminiThought extends GoogleGeminiChat {
  private toolCallParts = new Map<string, any[]>();
  private queuedToolParts: any[][] = [];
  private queuedToolReplayIndex = 0;
  private pendingParts: any[] = [];
  private pendingSignature?: string;

  async generate(
    messages: PsModelMessage[],
    streaming = false,
    streamingCallback?: (chunk: string) => void,
    media?: { mimeType: string; data: string }[],
    tools?: ChatCompletionTool[],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools?: string[]
  ): Promise<PsBaseModelReturnParameters> {
    this.resetCachedToolCalls(messages);
    try {
      return await super.generate(
        messages,
        streaming,
        streamingCallback,
        media,
        tools,
        toolChoice,
        allowedTools
      );
    } finally {
      this.pendingParts = [];
      this.pendingSignature = undefined;
    }
  }

  protected buildAssistantToolCallMessage(message: PsModelMessage) {
    const callId = message.toolCall?.id;
    let storedParts: any[] | undefined;

    if (callId && this.toolCallParts.has(callId)) {
      storedParts = this.toolCallParts.get(callId);
      this.logger.debug?.(
        `[GeminiThought] inject callId=${callId} parts=${storedParts?.length}`
      );
    } else if (!callId && this.queuedToolParts.length) {
      const idx = this.queuedToolReplayIndex;
      if (idx < this.queuedToolParts.length) {
        storedParts = this.queuedToolParts[idx];
        this.queuedToolReplayIndex += 1;
      }
      this.logger.debug?.(
        `[GeminiThought] inject queued tool=${message.toolCall?.name} parts=${storedParts?.length}`
      );
    }

    if (storedParts?.length) {
      this.logger.debug?.(
        `[GeminiThought] inject parts detail=${this.describeParts(storedParts)}`
      );
      return {
        role: "model",
        parts: storedParts.map((p) => this.clonePart(p)),
      };
    }

    this.logger.debug?.(
      `[GeminiThought] inject fallback tool=${message.toolCall?.name}`
    );
    const fallbackMessage = super.buildAssistantToolCallMessage(message);
    return this.ensureSyntheticSignature(message, fallbackMessage);
  }

  protected handleStreamChunk(chunk: GenerateContentResponse) {
    this.captureToolCallParts(chunk);
  }

  protected handleFinalResponse(response: GenerateContentResponse) {
    this.captureToolCallParts(response);
  }

  private captureToolCallParts(response?: GenerateContentResponse) {
    if (!response) return;
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      this.captureParts(candidate.content.parts);
    }
    if (Array.isArray(response.automaticFunctionCallingHistory)) {
      for (const historyEntry of response.automaticFunctionCallingHistory) {
        if (historyEntry?.parts) {
          this.captureParts(historyEntry.parts);
        }
      }
    }
  }

  private captureParts(parts: any[]) {
    let buffer: any[] = this.pendingParts.map((p) => this.clonePart(p));
    let pendingSignature = this.pendingSignature;

    for (const part of parts) {
      buffer.push(this.clonePart(part));
      const partSignature =
        typeof part?.thoughtSignature === "string"
          ? part.thoughtSignature
          : undefined;
      if (partSignature) {
        pendingSignature = partSignature;
        this.logger.debug?.(
          `[GeminiThought] pending signature updated len=${partSignature.length}`
        );
      }

      const callId = part?.functionCall?.id;
      if (callId) {
        if (!this.toolCallParts.has(callId)) {
          const clone = buffer.map((p) => this.clonePart(p));
          this.ensureFunctionCallSignature(clone, pendingSignature);
          this.toolCallParts.set(callId, clone);
          this.logger.debug?.(
            `[GeminiThought] capture callId=${callId} parts=${clone.length} detail=${this.describeParts(clone)}`
          );
        } else {
          this.logger.debug?.(
            `[GeminiThought] capture skip existing callId=${callId}`
          );
        }
        buffer = [];
      } else if (part?.functionCall) {
        const clone = buffer.map((p) => this.clonePart(p));
        this.ensureFunctionCallSignature(clone, pendingSignature);
        this.queuedToolParts.push(clone);
        this.logger.debug?.(
          `[GeminiThought] capture queued parts=${clone.length} totalQueue=${this.queuedToolParts.length} detail=${this.describeParts(clone)}`
        );
        buffer = [];
      }
    }

    this.pendingParts = buffer.map((p) => this.clonePart(p));
    this.pendingSignature = pendingSignature;
  }

  private resetCachedToolCalls(messages: PsModelMessage[]) {
    const toolCallMessages = messages.filter((m) => !!m.toolCall);
    if (!toolCallMessages.length) {
      if (this.toolCallParts.size || this.queuedToolParts.length) {
        this.logger.debug?.(
          "[GeminiThought] clearing cached tool calls for new conversation"
        );
      }
      this.toolCallParts.clear();
      this.queuedToolParts = [];
      this.queuedToolReplayIndex = 0;
      this.pendingParts = [];
      this.pendingSignature = undefined;
      return;
    }

    const referencedIds = new Set(
      toolCallMessages
        .map((m) => m.toolCall?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    );
    for (const cachedId of Array.from(this.toolCallParts.keys())) {
      if (!referencedIds.has(cachedId)) {
        this.logger.debug?.(
          `[GeminiThought] dropping cached callId=${cachedId} not present in current messages`
        );
        this.toolCallParts.delete(cachedId);
      }
    }

    const unnamedCount = toolCallMessages.filter(
      (m) => !m.toolCall?.id || m.toolCall.id.length === 0
    ).length;
    if (!unnamedCount) {
      this.queuedToolParts = [];
    } else if (this.queuedToolParts.length > unnamedCount) {
      this.logger.debug?.(
        `[GeminiThought] trimming queued parts from ${this.queuedToolParts.length} to ${unnamedCount}`
      );
      this.queuedToolParts = this.queuedToolParts.slice(-unnamedCount);
    }

    this.queuedToolReplayIndex = 0;
    this.pendingParts = [];
    this.pendingSignature = undefined;
  }

  private ensureFunctionCallSignature(parts: any[], signature?: string) {
    if (!signature) {
      this.logger.debug?.(
        `[GeminiThought] no thought signature available for parts=${this.describeParts(parts)}`
      );
      return;
    }
    const last = parts[parts.length - 1];
    if (last?.functionCall && !last.thoughtSignature) {
      last.thoughtSignature = signature;
      this.logger.debug?.(
        `[GeminiThought] applied pending signature len=${signature.length} to function=${last.functionCall.name}`
      );
    }
  }

  private ensureSyntheticSignature(
    message: PsModelMessage,
    payload: { role: string; parts: any[] }
  ) {
    const lastPart = payload.parts[payload.parts.length - 1];
    if (lastPart?.functionCall && !lastPart.thoughtSignature) {
      const synthetic = this.pendingSignature ?? this.buildSyntheticSignature(message);
      lastPart.thoughtSignature = synthetic;
      this.logger.debug?.(
        `[GeminiThought] injected synthetic signature len=${synthetic.length} for tool=${message.toolCall?.name}`
      );
    }
    return payload;
  }

  private buildSyntheticSignature(message: PsModelMessage) {
    const base =
      (message.toolCall?.id && message.toolCall.id.length
        ? message.toolCall.id
        : undefined) ?? message.toolCall?.name ?? "tool-call";
    return `synthetic_${base}`;
  }

  private clonePart(part: any) {
    return JSON.parse(JSON.stringify(part));
  }

  private describeParts(parts: any[]): string {
    return parts
      .map((part) => {
        if (part.functionCall) {
          return `functionCall:${part.functionCall.name},id=${part.functionCall.id},thoughtSig=${part.thoughtSignature?.length ?? 0}`;
        }
        if (part.thoughtSignature) {
          return `thoughtSig:${part.thoughtSignature.slice(0, 8)}…`;
        }
        if (part.text) {
          return `text:${part.text.slice(0, 20)}…`;
        }
        if (part.inlineData) {
          return `inlineData:${part.inlineData.mimeType}`;
        }
        if (part.functionResponse) {
          return `functionResponse:${part.functionResponse.name}`;
        }
        return "unknownPart";
      })
      .join(" | ");
  }
}

export default GoogleGeminiThought;
