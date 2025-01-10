import { BaseChatModel } from "./baseChatModel.js";
export declare class GoogleGeminiChat extends BaseChatModel {
    private client;
    private model;
    constructor(config: PsAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    }>;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=googleGeminiChat.d.ts.map