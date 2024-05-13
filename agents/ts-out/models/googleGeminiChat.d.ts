import { BaseChatModel } from "./baseChatModel";
export declare class GoogleGeminiChat extends BaseChatModel {
    private client;
    private model;
    constructor(apiKey: string);
    generate(messages: {
        role: string;
        message: string;
    }[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: {
        role: string;
        message: string;
    }[]): Promise<number>;
}
export default GoogleGeminiChat;
//# sourceMappingURL=googleGeminiChat.d.ts.map