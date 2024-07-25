import { BaseChatModel } from "./baseChatModel.js";
export declare class OpenAiChat extends BaseChatModel {
    private client;
    constructor(config: PsOpenAiModelConfig);
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export default OpenAiChat;
//# sourceMappingURL=openAiChat.d.ts.map