import { BaseChatModel } from "./baseChatModel.js";
interface PsAzureAiModelConfig {
    endpoint: string;
    apiKey: string;
    deploymentName: string;
    modelName?: string;
    maxTokensOut?: number;
    reasoningEffort?: 'low' | 'medium' | 'high';
    temperature?: number;
}
interface PsModelMessage {
    role: "system" | "developer" | "user" | "assistant";
    message: string;
}
export declare class AzureOpenAiChat extends BaseChatModel {
    private client;
    private deploymentName;
    private reasoningEffort;
    private temperature;
    constructor(config: PsAzureAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    } | undefined>;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export {};
//# sourceMappingURL=azureOpenAiChat.d.ts.map