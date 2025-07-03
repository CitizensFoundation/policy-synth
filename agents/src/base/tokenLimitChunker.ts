import { encoding_for_model, TiktokenModel } from "tiktoken";
import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PolicySynthSimpleAgentBase } from "./simpleAgent.js";
import { PolicySynthAgentBase } from "./agentBase.js";

export interface ModelCaller {
  callModel(
    type: PsAiModelType,
    size: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ): Promise<any>;
}

export class TokenLimitChunker extends PolicySynthAgentBase {
  constructor(private manager: ModelCaller) {
    super();
  }

  static isTokenLimitError(err: any): boolean {
    if (!err) return false;

    const m = (err.message || "").toLowerCase();
    const code =
      (err.code || err?.error?.code || err?.response?.data?.error?.code || "").toLowerCase();

    if (code === "context_length_exceeded" || code === "request_too_large") {
      this.logger.debug(`Token limit error: ${err.message}`);
      return true;
    }

    const isTokenLimitError = (
      m.includes("exceeds the maximum number of tokens") ||
      m.includes("maximum context length") ||
      m.includes("input token count") ||
      m.includes("exceeds context window size") ||
      m.includes("request exceeds the maximum allowed number of bytes") ||
      m.includes("string too long")
    );

    this.logger.debug(`Token limit error: ${isTokenLimitError}`);
    return isTokenLimitError;
  }

  static parseTokenLimit(err: any): number | undefined {
    if (!err?.message) return undefined;

    const matchGoogle = err.message.match(
      /maximum number of tokens allowed \((\d+)\)/i
    );
    if (matchGoogle) return parseInt(matchGoogle[1], 10);

    const matchOpenAi = err.message.match(/maximum context length is (\d+)/i);
    if (matchOpenAi) return parseInt(matchOpenAi[1], 10);

    const matchAnthropic = err.message.match(/context window size.*?(\d+)/i);
    if (matchAnthropic) return parseInt(matchAnthropic[1], 10);

    const matchStringTooLong = err.message.match(/maximum length (\d+)/i);
    if (matchStringTooLong) {
      const charLimit = parseInt(matchStringTooLong[1], 10);
      if (!isNaN(charLimit)) {
        return Math.floor(charLimit / 4);
      }
    }

    return undefined;
  }

  calcTokenLimitFromModel(model: BaseChatModel): number | undefined {
    if (model.config.maxContextTokens && model.config.maxTokensOut) {
      return model.config.maxContextTokens - model.config.maxTokensOut;
    } else {
      return undefined;
    }
  }

  calcTokenLimitFromError(model: BaseChatModel, err: any): number | undefined {
    if (model.config.maxContextTokens) {
      const parseLimit = TokenLimitChunker.parseTokenLimit(err);
      if (parseLimit) {
        return parseLimit-model.config.maxContextTokens;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  async handle(
    model: BaseChatModel,
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions,
    err: any
  ): Promise<any> {
    const limit =
      this.calcTokenLimitFromError(model, err) ||
      this.calcTokenLimitFromModel(model) ||
      (1000000-40000);
    this.logger.debug(`Token limit: ${limit}`);
    this.logger.debug(`Model name: ${model.modelName}`);
    this.logger.debug(`Model type: ${modelType}`);
    this.logger.debug(`Model size: ${modelSize}`);
    this.logger.debug(`Messages: ${messages.length}`);
    this.logger.debug(`Options: ${JSON.stringify(options)}`);
    this.logger.debug(`Error: ${JSON.stringify(err)}`);

    const modelName: TiktokenModel = "gpt-4o";
    const enc = encoding_for_model(modelName);

    const prefixMessages = messages.slice(0, -1);
    const docMessage = messages[messages.length - 1];

    this.logger.debug(`Prefix messages: ${JSON.stringify(prefixMessages, null, 2).slice(0, 1000)}`);
    this.logger.debug(`Doc message: ${JSON.stringify(docMessage, null, 2).slice(0, 1000)}`);

    const prefixText = prefixMessages.map((m) => m.message).join("\n");
    const prefixTokens = enc.encode(prefixText).length;
    this.logger.debug(`Prefix tokens: ${prefixTokens}`);

    const buffer = 120000;
    const allowed = limit - prefixTokens - buffer;
    this.logger.debug(`Allowed: ${allowed}`);

    const firstTagMatch = docMessage.message.match(/<[^>]+>/);
    const firstTag = firstTagMatch ? firstTagMatch[0] : "";

    const messageToChunk = firstTag
      ? docMessage.message.replace(firstTag, "")
      : docMessage.message;

    const docTokens = enc.encode(messageToChunk);
    this.logger.debug(`Doc tokens: ${docTokens.length}`);
    this.logger.debug(`Doc message: ${docMessage.message.slice(0, 1000)}`);
    const chunks: string[] = [];
    const decoder = new TextDecoder();
    for (let i = 0; i < docTokens.length; i += allowed) {
      const slice = docTokens.slice(i, i + allowed);
      const text = decoder.decode(enc.decode(slice));
      chunks.push(text);
    }
    enc.free();

    this.logger.debug(`Chunks: ${JSON.stringify(chunks, null, 2).slice(0, 3000)}`);

    const analyses: any[] = [];
    for (const chunk of chunks) {
      const chunkMessages = [
        ...prefixMessages,
        { role: docMessage.role, message: firstTag + chunk },
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
            "Token limit error occurred during chunk processing; aborting."
          );
        }
        throw e;
      }
    }

    const summaryText = analyses
      .map((a, idx) => `Analysis ${idx + 1}: ${typeof a === "string" ? a : JSON.stringify(a)}`)
      .join("\n\n");

    this.logger.debug(`Summary text: ${summaryText}`);

    const finalMessages = [
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

      this.logger.debug(`Final split analysis response: ${JSON.stringify(finalRes, null, 2)}`);

      return finalRes;
    } catch (e) {
      if (TokenLimitChunker.isTokenLimitError(e)) {
        this.logger.error(
          "Token limit error encountered while summarizing chunks; giving up."
        );
      }
      throw e;
    }
  }
}
