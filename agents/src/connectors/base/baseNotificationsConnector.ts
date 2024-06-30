import { PsBaseConnector } from "./baseConnector.js";

export abstract class PsBaseNotificationsConnector extends PsBaseConnector {
  abstract sendNotification(channel: string, message: string): Promise<void>;
  abstract getMessages(channel: string): Promise<string[]>;
}
