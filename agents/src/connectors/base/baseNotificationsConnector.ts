export abstract class BaseDocumentConnector {
  abstract sendNotification(channel: string, message: string): Promise<void>;
  abstract getMessages(channel: string): Promise<string[]>;
}
