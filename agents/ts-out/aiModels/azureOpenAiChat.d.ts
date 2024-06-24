import { BaseChatModel } from "./baseChatModel";
export declare class AzureOpenAiChat extends BaseChatModel {
    private client;
    private deploymentName;
    constructor(config: PsAzureAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=azureOpenAiChat.d.ts.map