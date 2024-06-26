import { TiktokenModel } from "tiktoken";
export declare abstract class BaseChatModel {
    modelName: string | TiktokenModel;
    maxTokensOut: number;
    constructor(modelName: string | TiktokenModel, maxTokensOut?: number);
    abstract generate(messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    abstract getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number>;
}
//# sourceMappingURL=baseChatModel.d.ts.map