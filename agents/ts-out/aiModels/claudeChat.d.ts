import { BaseChatModel } from "./baseChatModel.js";
export declare class ClaudeChat extends BaseChatModel {
    private client;
    constructor(config: PsAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: any;
    } | undefined>;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export default ClaudeChat;
//# sourceMappingURL=claudeChat.d.ts.map