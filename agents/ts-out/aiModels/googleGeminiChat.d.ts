import { BaseChatModel } from "./baseChatModel.js";
export declare class GoogleGeminiChat extends BaseChatModel {
    private client;
    private model;
    constructor(config: PsAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<undefined>;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export default GoogleGeminiChat;
//# sourceMappingURL=googleGeminiChat.d.ts.map