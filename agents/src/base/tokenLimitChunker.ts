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
      return true;
    }

    return (
      m.includes("exceeds the maximum number of tokens") ||
      m.includes("maximum context length") ||
      m.includes("input token count") ||
      m.includes("exceeds context window size") ||
      m.includes("request exceeds the maximum allowed number of bytes")
    );
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

    const modelName: TiktokenModel = "gpt-4o";
    const enc = encoding_for_model(modelName);

    const prefixMessages = messages.slice(0, -1);
    const docMessage = messages[messages.length - 1];

    const prefixText = prefixMessages.map((m) => m.message).join("\n");
    const prefixTokens = enc.encode(prefixText).length;

    const buffer = 2000;
    const allowed = limit - prefixTokens - buffer;
    const docTokens = enc.encode(docMessage.message);
    const chunks: string[] = [];
    const decoder = new TextDecoder();
    for (let i = 0; i < docTokens.length; i += allowed) {
      const slice = docTokens.slice(i, i + allowed);
      const text = decoder.decode(enc.decode(slice));
      chunks.push(text);
    }
    enc.free();

    const analyses: any[] = [];
    for (const chunk of chunks) {
      const chunkMessages = [
        ...prefixMessages,
        { role: docMessage.role, message: chunk },
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

    const finalMessages = [
      ...prefixMessages,
      { role: docMessage.role, message: summaryText },
    ];
    try {
      return await this.manager.callModel(
        modelType,
        modelSize,
        finalMessages,
        { ...options, disableChunkingRetry: true }
      );
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
