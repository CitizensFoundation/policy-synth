import { BaseIngestionAgent } from "./baseAgent.js";
export declare class DocumentAnalyzerAgent extends BaseIngestionAgent {
    maxAnalyzeTokenLength: number;
    systemMessage: PsModelMessage;
    userMessage: (data: string) => PsModelMessage;
    finalReviewSystemMessage: PsModelMessage;
    finalReviewUserMessage: (analysis: LlmDocumentAnalysisReponse) => PsModelMessage;
    analyze(fileId: string, data: string, filesMetaData?: Record<string, PsRagDocumentSource>): Promise<PsRagDocumentSource>;
}
//# sourceMappingURL=docAnalyzer.d.ts.map