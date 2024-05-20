import { BaseChatModel } from "./baseChatModel";
export declare class AzureOpenAiChat extends BaseChatModel {
    private client;
    private deploymentName;
    constructor(config: PSAzureModelConfig);
    generate(messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number>;
}
//# sourceMappingURL=azureOpenAiChat.d.ts.map