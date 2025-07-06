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

/** Absolute minimum context window across *all* deployed models. */ // ★ changed
const MIN_CONTEXT_TOKENS = 120_000;

/** Fallback “typical” window when nothing else is known (e.g. GPT‑4o 1 M). */ // ★ changed
const DEFAULT_MAX_CONTEXT_TOKENS = 1_000_000;

/**
 * Calculate a dynamic safety buffer:
 *   • at least 4 000 tokens so the model can answer;
 *   • 10 % of the context window, capped at 120 000 tokens.
 * This mirrors the original 120 k buffer for 1 M‑token models but stays
 * proportional for smaller windows.                                                    */ // ★ changed
function calcSafetyBuffer(windowSize: number): number {
  // ★ changed
  return Math.min(10_000, Math.max(4_000, Math.floor(windowSize * 0.1)));
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
    const contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];
    const { totalTokens } = await TokenLimitChunker.geminiAi.models.countTokens(
      {
        model: modelName,
        contents,
      }
    );
    return totalTokens ?? 0;
  }

  private async countTokens(
    model: BaseChatModel,
    text: string
  ): Promise<number> {
    const name = String(model.modelName).toLowerCase();
    if (name.includes("gemini")) {
      try {
        const count = await TokenLimitChunker.geminiTokenCount(
          String(model.modelName),
          text
        );
        this.logger.debug(`Gemini token count: ${count}`);
        return count;
      } catch (err) {
        this.logger.warn(`Gemini token count failed: ${err}`);
      }
    }
    const enc = encoding_for_model("gpt-4o");
    try {
      const count = enc.encode(text).length;
      this.logger.debug(`OpenAI Token count: ${count}`);
      return count;
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

  private calcTokenLimitFromModel(model: BaseChatModel): number {
    const { maxContextTokens, maxTokensOut } = model.config;
    this.logger.debug(
      `calcTokenLimitFromModel: maxContextTokens=${maxContextTokens}, maxTokensOut=${maxTokensOut}`
    );
    if (maxContextTokens) {
      return maxContextTokens - (maxTokensOut ?? 0);
    } else {
      this.logger.error(
        `calcTokenLimitFromModel: model.config.maxContextTokens is undefined`
      );
      return 120_000;
    }
  }

  private async chunkByTokens(
    model: BaseChatModel,
    text: string,
    allowedTokens: number
  ): Promise<string[]> {
    const name = String(model.modelName).toLowerCase();

    this.logger.debug(`chunkByTokens: model.modelName=${model.modelName}`);
    this.logger.debug(`chunkByTokens: text.length=${text.length}`);
    this.logger.debug(`chunkByTokens: allowedTokens=${allowedTokens}`);

    /* ---------- OpenAI & other tiktoken-based models ---------- */
    if (!name.includes("gemini")) {
      const enc = encoding_for_model("gpt-4o");
      try {
        this.logger.debug("openai chunking");
        const allIds = enc.encode(text); // Uint32Array of token-ids
        const chunks: string[] = [];
        for (let i = 0; i < allIds.length; i += allowedTokens) {
          const slice = allIds.subarray(i, i + allowedTokens);
          chunks.push(new TextDecoder().decode(enc.decode(slice)));
        }
        return chunks;
      } finally {
        enc.free();
      }
    }

    const AVG_CHARS_PER_TOKEN = 4;
    const paragraphs = text.split(/\n{2,}/);
    const chunks: string[] = [];

    let buffer: string[] = [];
    let estRatio = 1 / AVG_CHARS_PER_TOKEN; // adaptive tokens-per-char guess

    this.logger.debug(`gemini chunkByTokens: estRatio=${estRatio} 1`);

    this.logger.debug(`gemini chunkByTokens: paragraphs.length=${paragraphs.length}`);

    const THRESHOLD = allowedTokens * 0.95;

    for (const para of paragraphs) {
      const candidate = buffer.length
        ? `${buffer.join("\n\n")}\n\n${para}`
        : para;

      let approxTokens = AVG_CHARS_PER_TOKEN*candidate.length;
      if (approxTokens > THRESHOLD) {
        const exactTokens = await this.countTokens(model, candidate);
        estRatio = exactTokens / candidate.length || estRatio;
        this.logger.debug(`gemini chunkByTokens: estRatio=${estRatio} exactTokens=${exactTokens} candidate.length=${candidate.length}`);
        approxTokens = exactTokens;
      }

      if (approxTokens <= allowedTokens) {
        buffer.push(para);
        continue;
      }

      if (buffer.length) {
        chunks.push(buffer.join("\n\n"));
      }

      buffer = [para];
      const paraTokens = await this.countTokens(model, para);
      //estRatio = paraTokens / para.length || estRatio;
      this.logger.debug(`gemini chunkByTokens: estRatio=${estRatio} paraTokens=${paraTokens} para.length=${para.length}`);

      if (paraTokens > allowedTokens) {
        // Extremely long single paragraph; hard-split by characters.
        let sliceStart = 0;
        const approxChars = Math.floor(allowedTokens / estRatio);
        while (sliceStart < para.length) {
          const slice = para.slice(sliceStart, sliceStart + approxChars);
          chunks.push(slice);
          sliceStart += approxChars;
        }
        buffer = [];
      }
    }

    if (buffer.length) {
      const last = buffer.join("\n\n");
      const lastTokens = await this.countTokens(model, last);
      if (lastTokens > allowedTokens) {
        // Recursively split the final chunk
        const split = await this.chunkByTokens(model, last, allowedTokens);
        chunks.push(...split);
      } else {
        chunks.push(last);
      }
    }

    this.logger.debug(`gemini chunkByTokens: chunks.length=${chunks.length}`);

    return chunks;
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
    let tokenLimit = this.calcTokenLimitFromModel(model);

    this.logger.debug(`calcTokenLimitFromModel: tokenLimit=${tokenLimit}`);

    /* ---------------------------------------------------------
     * 2. Build prefix / extract doc message.
     * ------------------------------------------------------- */
    const prefixMessages = messages.slice(0, -1);
    const docMessage = messages[messages.length - 1];

    const prefixText = prefixMessages.map((m) => m.message).join("\n");
    const prefixTokenCount = await this.countTokens(model, prefixText);

    this.logger.debug(`TokenLimitChunker: prefixText.length=${prefixText.length}`);
    this.logger.debug(`TokenLimitChunker: prefixTokenCount=${prefixTokenCount}`);

    const safetyBuffer = 10_000;
    const allowedPerChunk = tokenLimit - prefixTokenCount - safetyBuffer;

    if (allowedPerChunk <= 0) {
      throw new Error(
        `TokenLimitChunker: The prefix alone (${prefixTokenCount} tokens) leaves no room for the document within the ${tokenLimit}-token window (buffer=${safetyBuffer}).`
      );
    }

    this.logger.debug(
      `TokenLimitChunker: prefixTokens=${prefixTokenCount}, safetyBuffer=${safetyBuffer}, chunkBudget=${allowedPerChunk}`
    );

    /* ---------------------------------------------------------
     * 3. Slice document into chunks.
     * ------------------------------------------------------- */
    const tagName = options.xmlTagToPreserveForTooManyTokenSplitting;
    const tagRegex = tagName
      ? new RegExp(
          `<${tagName}[^>]*>[\\s\\S]*?<\\/${tagName}>`,
          "i"
        )
      : /<[^>]+>/;
    const tagMatch = docMessage.message.match(tagRegex);
    const lastTag = tagMatch ? tagMatch[0] : "";
    let bodyWithoutTag = lastTag
      ? docMessage.message.replace(lastTag, "")
      : docMessage.message;

    const lastWordCount =
      options.numberOfLastWordsToPreserveForTooManyTokenSplitting ?? 50;
    const bodyWords = bodyWithoutTag.split(" ");
    const preservedWords = bodyWords.splice(
      Math.max(0, bodyWords.length - lastWordCount),
      lastWordCount
    );
    const endWords = preservedWords.join(" ");
    bodyWithoutTag = bodyWords.join(" ");

    this.logger.debug(`TokenLimitChunker: tag=${lastTag}`);

    const totalDocTokens = await this.countTokens(model, bodyWithoutTag);

    if (totalDocTokens > allowedPerChunk) {
      this.logger.debug(
        `Document is ${totalDocTokens} tokens; splitting with budget ${allowedPerChunk}.`
      );
    }

    const tagCount = lastTag ? await this.countTokens(model, lastTag) : 0;
    const endWordsCount = endWords
      ? await this.countTokens(model, endWords)
      : 0;

    const allowedPerChunkWithTag = allowedPerChunk - tagCount - endWordsCount;

    const MIN_ALLOWED_CHUNK_SIZE = 5000;
    const MIN_RECOMMENDED_CHUNK_SIZE = 20000;

    if (allowedPerChunkWithTag <= MIN_ALLOWED_CHUNK_SIZE) {
      const extra = tagCount + endWordsCount;
      throw new Error(
        `TokenLimitChunker: Preserved context (${extra} tokens) leaves no room for the document within the ${tokenLimit}-token window (buffer=${safetyBuffer}).`
      );
    }

    if (allowedPerChunkWithTag < MIN_RECOMMENDED_CHUNK_SIZE) {
      this.logger.error(
        `TokenLimitChunker: Chunk size ${allowedPerChunkWithTag} is less than the recommended ${MIN_RECOMMENDED_CHUNK_SIZE}.`
      );
    }

    this.logger.debug(`TokenLimitChunker: allowedPerChunkWithTag=${allowedPerChunkWithTag}`);

    const chunks = await this.chunkByTokens(
      model,
      bodyWithoutTag,
      allowedPerChunkWithTag
    );

    /* ---------------------------------------------------------
     * 4. Analyse each chunk with the underlying model.
     * ------------------------------------------------------- */
    const analyses: any[] = [];

    for (let idx = 0; idx < chunks.length; idx++) {
      this.logger.debug(`TokenLimitChunker: chunking chunk ${idx + 1} of ${chunks.length}`);
      let chunkText = `<PartialDocument index="${idx + 1}">${
        chunks[idx]
      }</PartialDocument>`;
      if (lastTag) {
        chunkText += `\n${lastTag}`;
        this.logger.debug(`TokenLimitChunker: lastTag=${lastTag}`);
      }
      if (endWords) {
        chunkText += ` ${endWords}`;
        this.logger.debug(`TokenLimitChunker: endWords=${endWords}`);
      }
      chunkText = `${chunkText.trim()}\n`;
      const chunkMessages: PsModelMessage[] = [
        ...prefixMessages,
        { role: docMessage.role, message: chunkText },
      ];

      this.logger.debug(`TokenLimitChunker: chunkMessages.length=${chunkMessages.length}`);

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
            `Token limit error inside chunk loop – aborting further processing. ${idx} ${chunkText.length} ${e}`
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
        `Final summarisation response: ${JSON.stringify(
          finalRes,
          null,
          2
        ).slice(0, 1000)}`
      );
      return finalRes;
    } catch (e) {
      if (TokenLimitChunker.isTokenLimitError(e)) {
        this.logger.error(
          "Token limit error during final summary – giving up."
        );
      }
      throw e;
    }
  }
}
