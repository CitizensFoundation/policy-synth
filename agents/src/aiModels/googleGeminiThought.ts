import type { GenerateContentResponse } from "@google/genai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import { GoogleGeminiChat } from "./googleGeminiChat.js";

export class GoogleGeminiThought extends GoogleGeminiChat {
  private toolCallParts = new Map<string, any[]>();
  private queuedToolParts: any[][] = [];
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
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      result = await super.generate(
        messages,
        streaming,
        streamingCallback,
        media,
        tools,
        toolChoice,
        allowedTools
      );

      if (result.content || (result.toolCalls && result.toolCalls.length > 0)) {
        return result;
      }

      if (retryCount < maxRetries) {
        this.logger.error?.(`[GeminiThought] Empty content and no tool calls. Retry number ${retryCount + 1}`, JSON.stringify(result, null, 2));
      } else {
        this.logger.error?.(`[GeminiThought] Empty content and no tool calls. Failed after ${retryCount} retries.`, JSON.stringify(result, null, 2));
      }
      retryCount++;
    }

    return result!;
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
      const queuedParts = this.queuedToolParts.shift();
      if (queuedParts) {
        storedParts = queuedParts;
        this.queuedToolParts.push(queuedParts);
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
    return super.buildAssistantToolCallMessage(message);
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
