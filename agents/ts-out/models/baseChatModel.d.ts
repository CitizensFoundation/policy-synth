export declare abstract class BaseChatModel {
    abstract generate(messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function): Promise<any>;
    abstract getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number>;
}
//# sourceMappingURL=baseChatModel.d.ts.map