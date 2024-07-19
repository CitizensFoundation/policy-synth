
import { TiktokenModel } from "tiktoken";

export abstract class BaseChatModel {
  modelName: string | TiktokenModel;
  maxTokensOut: number;

  constructor(modelName: string | TiktokenModel, maxTokensOut: number = 4096) {
    this.modelName = modelName;
    this.maxTokensOut = maxTokensOut;
  }

  abstract generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<{tokensIn: number, tokensOut: number, content: string} | undefined>;

  abstract getEstimatedNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number>;
}
