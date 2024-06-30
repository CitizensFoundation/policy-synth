import { PsBaseConnector } from "./baseConnector.js";
export declare abstract class PsBaseDocumentConnector extends PsBaseConnector {
    abstract getDocument(): Promise<string>;
    abstract updateDocument(doc: string): Promise<void>;
}
//# sourceMappingURL=baseDocumentConnector.d.ts.map