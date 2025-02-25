import { BaseChatModel } from "./baseChatModel.js";
import { ContentBlock } from "@anthropic-ai/sdk/resources/messages/messages.js";
export declare class ClaudeChat extends BaseChatModel {
    private client;
    private maxThinkingTokens?;
    private config;
    constructor(config: PsAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    } | undefined>;
    getTextTypeFromContent(content: ContentBlock[]): string;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export default ClaudeChat;
//# sourceMappingURL=claudeChat.d.ts.map