import { TiktokenModel } from "tiktoken";

export abstract class BaseChatModel {
  modelName: string | TiktokenModel;

  constructor(modelName: string | TiktokenModel) {
    this.modelName = modelName;
  }

  abstract generate(
    messages: PsModelChatItem[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any>;

  abstract getNumTokensFromMessages(
    messages: PsModelChatItem[]
  ): Promise<number>;
}
