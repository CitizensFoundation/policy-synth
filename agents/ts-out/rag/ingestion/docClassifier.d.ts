import { BaseIngestionAgent } from "./baseAgent.js";
export declare class DocumentClassifierAgent extends BaseIngestionAgent {
    systemMessage: (schema: string, about: string) => PsModelMessage;
    userMessage: (title: string, decription: string, url: string) => PsModelMessage;
    classify(metadata: PsRagDocumentSource, dataLayout: PsIngestionDataLayout): Promise<void>;
    classifyAllDocuments(documentSources: PsRagDocumentSource[], dataLayout: PsIngestionDataLayout): Promise<void>;
}
//# sourceMappingURL=docClassifier.d.ts.map