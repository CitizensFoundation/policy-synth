import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export declare class IngestionDocAnalyzerAgent extends BaseIngestionAgent {
    maxAnalyzeTokenLength: number;
    systemMessage: SystemMessage;
    userMessage: (data: string) => HumanMessage;
    finalReviewSystemMessage: SystemMessage;
    finalReviewUserMessage: (analysis: LlmDocumentAnalysisReponse) => HumanMessage;
    analyze(fileId: string, data: string, filesMetaData?: Record<string, CachedFileMetadata>): Promise<CachedFileMetadata>;
}
//# sourceMappingURL=docAnalyzerAgent.d.ts.map