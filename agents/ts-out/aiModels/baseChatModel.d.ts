import { TiktokenModel } from "tiktoken";
import { PolicySynthAgentBase } from "../base/agentBase.js";
export declare abstract class BaseChatModel extends PolicySynthAgentBase {
    modelName: string | TiktokenModel;
    maxTokensOut: number;
    constructor(modelName: string | TiktokenModel, maxTokensOut?: number);
    abstract generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    } | undefined>;
    abstract getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
    private truncateXmlTags;
    prettyPrintPromptMessages(messages: {
        role: string;
        content: string;
    }[]): string;
}
//# sourceMappingURL=baseChatModel.d.ts.map