import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export declare class DocumentClassifierAgent extends BaseIngestionAgent {
    maxAnalyzeTokenLength: number;
    systemMessage: (schema: string) => SystemMessage;
    userMessage: (data: string) => HumanMessage;
    reviewSystemMessage: SystemMessage;
    reviewUserMessage: (analysis: LlmDocumentAnalysisReponse) => HumanMessage;
    classify(fileId: string, data: string, filesMetaData?: Record<string, DocumentSource>): Promise<DocumentSource>;
}
//# sourceMappingURL=docClassifier.d.ts.map