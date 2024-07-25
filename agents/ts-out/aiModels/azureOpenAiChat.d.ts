import { BaseChatModel } from "./baseChatModel.js";
export declare class AzureOpenAiChat extends BaseChatModel {
    private client;
    private deploymentName;
    constructor(config: PsAzureAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    } | undefined>;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=azureOpenAiChat.d.ts.map