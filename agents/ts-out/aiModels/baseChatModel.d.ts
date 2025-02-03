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
    /**
     * Truncate the text inside XML-like tags to a certain length.
     * For example:
     *   <systemMessage>This text is extremely long ...</systemMessage>
     * becomes
     *   <systemMessage>This text is extr... [TRUNCATED: 1234 chars]</systemMessage>
     *
     * @param text - The original text that may contain XML-like tags
     * @param maxChars - The maximum number of characters to allow inside the tag
     * @returns The text with tag contents truncated.
     */
    truncateXmlTags(text: string, maxChars?: number): string;
    prettyPrintPromptMessages(messages: {
        role: string;
        content: string;
    }[]): string;
}
//# sourceMappingURL=baseChatModel.d.ts.map