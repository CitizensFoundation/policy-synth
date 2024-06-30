export declare abstract class BaseDocumentConnector {
    abstract sendNotification(channel: string, message: string): Promise<void>;
    abstract getMessages(channel: string): Promise<string[]>;
}
//# sourceMappingURL=baseNotificationsConnector.d.ts.map