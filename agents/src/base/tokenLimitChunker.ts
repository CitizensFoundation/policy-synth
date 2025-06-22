import { encoding_for_model, TiktokenModel } from "tiktoken";
import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";

export interface ModelCaller {
  callModel(
    type: PsAiModelType,
    size: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ): Promise<any>;
}

export class TokenLimitChunker {
  constructor(private manager: ModelCaller) {}

  static isTokenLimitError(err: any): boolean {
    if (!err?.message) return false;
    const m = err.message.toLowerCase();
    return (
      m.includes("exceeds the maximum number of tokens") ||
      m.includes("maximum context length")
    );
  }

  static parseTokenLimit(err: any): number | undefined {
    if (!err?.message) return undefined;
    const match = err.message.match(/maximum number of tokens allowed \((\d+)\)/i);
    if (match) return parseInt(match[1], 10);
    const match2 = err.message.match(/maximum context length is (\d+)/i);
    if (match2) return parseInt(match2[1], 10);
    return undefined;
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
      TokenLimitChunker.parseTokenLimit(err) ||
      model.maxTokensOut ||
      1000000;

    const enc = encoding_for_model(model.modelName as TiktokenModel);

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
      const res = await this.manager.callModel(
        modelType,
        modelSize,
        chunkMessages,
        options
      );
      analyses.push(res);
    }

    const summaryText = analyses
      .map((a, idx) => `Analysis ${idx + 1}: ${typeof a === "string" ? a : JSON.stringify(a)}`)
      .join("\n\n");

    const finalMessages = [
      ...prefixMessages,
      { role: docMessage.role, message: summaryText },
    ];
    return this.manager.callModel(modelType, modelSize, finalMessages, options);
  }
}
