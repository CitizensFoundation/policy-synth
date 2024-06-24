
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
  ): Promise<any>;

  abstract getNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number>;
}
