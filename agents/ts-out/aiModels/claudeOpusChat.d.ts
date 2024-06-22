import { BaseChatModel } from "./baseChatModel";
export declare class ClaudeOpusChat extends BaseChatModel {
    private client;
    constructor(config: PSModelConfig);
    generate(messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number>;
}
export default ClaudeOpusChat;
//# sourceMappingURL=claudeOpusChat.d.ts.map