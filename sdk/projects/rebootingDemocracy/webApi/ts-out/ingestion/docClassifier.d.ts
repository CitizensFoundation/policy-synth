import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export declare class DocumentClassifierAgent extends BaseIngestionAgent {
    systemMessage: (schema: string, about: string) => SystemMessage;
    userMessage: (title: string, decription: string, url: string) => HumanMessage;
    classify(metadata: PsRagDocumentSource, dataLayout: PsIngestionDataLayout): Promise<void>;
    classifyAllDocuments(documentSources: PsRagDocumentSource[], dataLayout: PsIngestionDataLayout): Promise<void>;
}
//# sourceMappingURL=docClassifier.d.ts.map