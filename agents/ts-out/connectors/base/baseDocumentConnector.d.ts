export declare abstract class BaseDocumentConnector {
    abstract getDocument(): Promise<string>;
    abstract updateDocument(doc: string): Promise<void>;
    abstract deleteDocument(): Promise<void>;
}
//# sourceMappingURL=baseDocumentConnector.d.ts.map