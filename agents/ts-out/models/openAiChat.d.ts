import { BaseChatModel } from "./baseChatModel";
export declare class OpenAiChat extends BaseChatModel {
    private client;
    constructor(apiKey: string, modelName?: string, maxTokensOut?: number);
    generate(messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number>;
}
export default OpenAiChat;
//# sourceMappingURL=openAiChat.d.ts.map