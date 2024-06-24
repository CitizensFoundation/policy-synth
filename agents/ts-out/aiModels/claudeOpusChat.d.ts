import { BaseChatModel } from "./baseChatModel";
export declare class ClaudeOpusChat extends BaseChatModel {
    private client;
    constructor(config: PsAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export default ClaudeOpusChat;
//# sourceMappingURL=claudeOpusChat.d.ts.map