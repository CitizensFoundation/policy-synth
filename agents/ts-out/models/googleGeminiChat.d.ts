import { BaseChatModel } from "./baseChatModel";
export declare class GoogleGeminiChat extends BaseChatModel {
    private client;
    private model;
    constructor(apiKey: string, modelName?: string);
    generate(messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number>;
}
export default GoogleGeminiChat;
//# sourceMappingURL=googleGeminiChat.d.ts.map