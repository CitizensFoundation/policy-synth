import { PsBaseConnector } from "./baseConnector.js";

export abstract class PsBaseDocumentConnector extends PsBaseConnector {
  abstract getDocument(): Promise<string>;
  abstract updateDocument(doc: string): Promise<void>;
  abstract updateDocumentFromMarkdown(markdown: string): Promise<void>;
}
