import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsRagVectorSearch extends PolicySynthAgentBase {
    minQualityEloRatingForChunk: number;
    minQualityEloRatingForDocument: number;
    search(userQuestion: string, routingData: PsRagRoutingResponse, dataLayout: PsIngestionDataLayout): Promise<string>;
    processAndMergeResults(documentResults: PsRagDocumentSourceGraphQlResponse, documentsWithChunksResults: PsRagDocumentSource[]): PsRagDocumentSource[];
    formatOutput(processedResults: PsRagDocumentSource[]): string;
}
//# sourceMappingURL=vectorSearch.d.ts.map