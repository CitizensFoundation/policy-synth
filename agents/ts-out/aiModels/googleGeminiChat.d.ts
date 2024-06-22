import { BaseChatModel } from "./baseChatModel";
export declare class GoogleGeminiChat extends BaseChatModel {
    private client;
    private model;
    constructor(config: PSModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export default GoogleGeminiChat;
//# sourceMappingURL=googleGeminiChat.d.ts.map