/****************************************************************************************
 * TokenLimitChunker.ts
 * Chunk‑then‑summarise helper that retries large prompts when the model rejects them
 * for context‑window overflow.  Revised July 2025.
 ****************************************************************************************/

import { encoding_for_model, TiktokenModel } from "tiktoken";
import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import { GoogleGenAI, Content } from "@google/genai";

export interface ModelCaller {
  callModel(
    type: PsAiModelType,
    size: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ): Promise<any>;
}

/* ──────────────────────────────────────────────────────────────────────────
 *  CONFIG CONSTANTS
 * ──────────────────────────────────────────────────────────────────────── */

/** Absolute minimum context window across *all* deployed models. */           // ★ changed
const MIN_CONTEXT_TOKENS = 120_000;

/** Fallback “typical” window when nothing else is known (e.g. GPT‑4o 1 M). */ // ★ changed
const DEFAULT_MAX_CONTEXT_TOKENS = 1_000_000;

/**
 * Calculate a dynamic safety buffer:
 *   • at least 4 000 tokens so the model can answer;
 *   • 10 % of the context window, capped at 120 000 tokens.
 * This mirrors the original 120 k buffer for 1 M‑token models but stays
 * proportional for smaller windows.                                                    */ // ★ changed
function calcSafetyBuffer(windowSize: number): number {                                 // ★ changed
  return Math.min(120_000, Math.max(4_000, Math.floor(windowSize * 0.10)));
}

export class TokenLimitChunker extends PolicySynthAgentBase {
  constructor(private readonly manager: ModelCaller) {
    super();
  }

  private static geminiAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  private static async geminiTokenCount(
    modelName: string,
    prompt: string
  ): Promise<number> {
    const contents: Content[] = [
      { role: "user", parts: [{ text: prompt }] },
    ];
    const { totalTokens } = await TokenLimitChunker.geminiAi.models.countTokens({
      model: modelName,
      contents,
    });
    return totalTokens ?? 0;
  }

  private decodeTokens(
    model: BaseChatModel,
    enc: any,
    tokens: Uint32Array
  ): string {
    const name = String(model.modelName).toLowerCase();
    // Gemini provides no token decoder; fall back to tiktoken
    return new TextDecoder().decode(enc.decode(tokens));
  }

  private async countTokens(model: BaseChatModel, text: string): Promise<number> {
    const name = String(model.modelName).toLowerCase();
    if (name.includes("gemini")) {
      try {
        return await TokenLimitChunker.geminiTokenCount(String(model.modelName), text);
      } catch (err) {
        this.logger.warn(`Gemini token count failed: ${err}`);
      }
    }
    const enc = encoding_for_model("gpt-4o");
    try {
      return enc.encode(text).length;
    } finally {
      enc.free();
    }
  }

  /* ----------------------------------------------------------------------
   *  ERROR‑DETECTION UTILITIES
   * -------------------------------------------------------------------- */

  static isTokenLimitError(err: unknown): boolean {
    if (!err) return false;

    const m = String((err as any).message ?? "").toLowerCase();
    const code = String(
      (err as any).code ??
        (err as any)?.error?.code ??
        (err as any)?.response?.data?.error?.code ??
        ""
    ).toLowerCase();

    if (code === "context_length_exceeded" || code === "request_too_large")
      return true;

    return (
      m.includes("exceeds the maximum number of tokens") ||
      m.includes("maximum context length") ||
      m.includes("input token count") ||
      m.includes("exceeds context window size") ||
      m.includes("request exceeds the maximum allowed number of bytes") ||
      m.includes("string too long")
    );
  }

  /** Extract the model’s context‑window size (tokens) from a provider error msg. */
  static parseTokenLimit(err: any): number | undefined {
    const msg: string = err?.message ?? "";

    const mGoogle = msg.match(/maximum number of tokens allowed\s*\((\d+)\)/i);
    if (mGoogle) return parseInt(mGoogle[1], 10);

    const mOpenAI = msg.match(/maximum context length is\s*(\d+)/i);
    if (mOpenAI) return parseInt(mOpenAI[1], 10);

    const mAnthropic = msg.match(/context window size.*?(\d+)/i);
    if (mAnthropic) return parseInt(mAnthropic[1], 10);

    const mStrTooLong = msg.match(/maximum length\s*(\d+)/i);
    if (mStrTooLong) {
      const charLimit = parseInt(mStrTooLong[1], 10);
      if (!Number.isNaN(charLimit)) return Math.floor(charLimit / 4);
    }

    return undefined;
  }

  /* ----------------------------------------------------------------------
   *  LIMIT CALCULATIONS
   * -------------------------------------------------------------------- */

  /** Remaining tokens available for *prompt* (i.e. maxContext − maxTokensOut). */
  private calcTokenLimitFromModel(model: BaseChatModel): number | undefined {
    const { maxContextTokens, maxTokensOut } = model.config;
    this.logger.debug(`calcTokenLimitFromModel: maxContextTokens=${maxContextTokens}, maxTokensOut=${maxTokensOut}`);
    if (maxContextTokens) {
      return maxContextTokens - (maxTokensOut ?? 0);
    }
    return undefined;
  }

  /** Fallback: derive token limit from the provider error. */
  private calcTokenLimitFromError(
    model: BaseChatModel,
    err: any
  ): number | undefined {
    const contextWindow = TokenLimitChunker.parseTokenLimit(err);
    this.logger.debug(`calcTokenLimitFromError: parseTokenLimit.contextWindow=${contextWindow}`);
    if (!contextWindow) return undefined;

    const { maxTokensOut } = model.config;
    this.logger.debug(`calcTokenLimitFromError: model.config.maxTokensOut=${maxTokensOut}`);
    return contextWindow - (maxTokensOut ?? 0);
  }

  /* ----------------------------------------------------------------------
   *  MAIN HANDLER
   * -------------------------------------------------------------------- */

  async handle(
    model: BaseChatModel,
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions,
    err: any
  ): Promise<any> {
    /* ---------------------------------------------------------
     * 1. Determine usable prompt window.
     * ------------------------------------------------------- */
    let tokenLimit =
      this.calcTokenLimitFromError(model, err) ??
      this.calcTokenLimitFromModel(model) ??
      DEFAULT_MAX_CONTEXT_TOKENS;

    // Guarantee at least the documented minimum window.
    tokenLimit = Math.max(tokenLimit, MIN_CONTEXT_TOKENS);                           // ★ changed
    this.logger.debug(`Determined prompt token limit: ${tokenLimit}`);

    /* ---------------------------------------------------------
     * 2. Build prefix / extract doc message.
     * ------------------------------------------------------- */
    const prefixMessages = messages.slice(0, -1);
    const docMessage = messages[messages.length - 1];

    const prefixText = prefixMessages.map((m) => m.message).join("\n");
    const prefixTokenCount = await this.countTokens(model, prefixText);

    const encModel: TiktokenModel = "gpt-4o";
    const enc = encoding_for_model(encModel);

    const safetyBuffer = calcSafetyBuffer(tokenLimit);                              // ★ changed
    const allowedPerChunk = tokenLimit - prefixTokenCount - safetyBuffer;           // ★ changed

    if (allowedPerChunk <= 0) {
      enc.free();
      throw new Error(
        `TokenLimitChunker: The prefix alone (${prefixTokenCount} tokens) leaves no room for the document within the ${tokenLimit}-token window (buffer=${safetyBuffer}).`
      );
    }

    this.logger.debug(
      `prefixTokens=${prefixTokenCount}, safetyBuffer=${safetyBuffer}, chunkBudget=${allowedPerChunk}`
    );

    /* ---------------------------------------------------------
     * 3. Slice document into chunks.
     * ------------------------------------------------------- */
    const firstTagMatch = docMessage.message.match(/<[^>]+>/);
    const firstTag = firstTagMatch ? firstTagMatch[0] : "";
    const bodyWithoutTag = firstTag
      ? docMessage.message.replace(firstTag, "")
      : docMessage.message;

    const docTokens = enc.encode(bodyWithoutTag);
    const totalDocTokens = docTokens.length;

    const chunks: string[] = [];
    let cursor = 0;
    while (cursor < totalDocTokens) {
      const slice = docTokens.slice(cursor, cursor + allowedPerChunk);
      const text = this.decodeTokens(model, enc, slice);
      chunks.push(text);
      cursor += allowedPerChunk;
    }

    enc.free(); // finished with encoder

    this.logger.debug(
      `Document split into ${chunks.length} chunks (~${allowedPerChunk} tokens each)`
    );

    /* ---------------------------------------------------------
     * 4. Analyse each chunk with the underlying model.
     * ------------------------------------------------------- */
    const analyses: any[] = [];

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunkText = idx === 0 && firstTag ? firstTag + chunks[idx] : chunks[idx];
      const chunkMessages: PsModelMessage[] = [
        ...prefixMessages,
        { role: docMessage.role, message: chunkText },
      ];

      try {
        const res = await this.manager.callModel(
          modelType,
          modelSize,
          chunkMessages,
          { ...options, disableChunkingRetry: true }
        );
        analyses.push(res);
      } catch (e) {
        if (TokenLimitChunker.isTokenLimitError(e)) {
          this.logger.error(
            "Token limit error inside chunk loop – aborting further processing."
          );
        }
        throw e;
      }
    }

    /* ---------------------------------------------------------
     * 5. Summarise the per‑chunk analyses.
     * ------------------------------------------------------- */
    const summaryText = analyses
      .map((a, i) =>
        typeof a === "string"
          ? `Analysis ${i + 1}: ${a}`
          : `Analysis ${i + 1}: ${JSON.stringify(a)}`
      )
      .join("\n\n");

    const finalMessages: PsModelMessage[] = [
      ...prefixMessages,
      { role: docMessage.role, message: summaryText },
    ];

    try {
      const finalRes = await this.manager.callModel(
        modelType,
        modelSize,
        finalMessages,
        { ...options, disableChunkingRetry: true }
      );
      this.logger.debug(
        `Final summarisation response: ${JSON.stringify(finalRes, null, 2).slice(0, 1000)}`
      );
      return finalRes;
    } catch (e) {
      if (TokenLimitChunker.isTokenLimitError(e)) {
        this.logger.error("Token limit error during final summary – giving up.");
      }
      throw e;
    }
  }
}
