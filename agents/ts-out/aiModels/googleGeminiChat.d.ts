import { BaseChatModel } from "./baseChatModel.js";
interface PsAiModelConfig {
    apiKey: string;
    modelName?: string;
    maxTokensOut?: number;
}
export declare class GoogleGeminiChat extends BaseChatModel {
    private client;
    private model;
    constructor(config: PsAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    }>;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export {};
//# sourceMappingURL=googleGeminiChat.d.ts.map