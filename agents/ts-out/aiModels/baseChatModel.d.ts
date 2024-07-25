import { TiktokenModel } from "tiktoken";
export declare abstract class BaseChatModel {
    modelName: string | TiktokenModel;
    maxTokensOut: number;
    constructor(modelName: string | TiktokenModel, maxTokensOut?: number);
    abstract generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    } | undefined>;
    abstract getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=baseChatModel.d.ts.map