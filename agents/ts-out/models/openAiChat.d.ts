import { BaseChatModel } from './baseChatModel';
export declare class OpenAiChat extends BaseChatModel {
    private client;
    constructor(apiKey: string);
    generate(messages: {
        role: string;
        message: string;
    }[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    getNumTokensFromMessages(messages: {
        role: string;
        message: string;
    }[]): Promise<number>;
}
export default OpenAiChat;
//# sourceMappingURL=openAiChat.d.ts.map