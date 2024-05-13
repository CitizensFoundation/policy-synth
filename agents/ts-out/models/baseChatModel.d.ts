export declare abstract class BaseChatModel {
    abstract generate(messages: {
        role: string;
        message: string;
    }[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    abstract getNumTokensFromMessages(messages: {
        role: string;
        message: string;
    }[]): Promise<number>;
}
//# sourceMappingURL=baseChatModel.d.ts.map