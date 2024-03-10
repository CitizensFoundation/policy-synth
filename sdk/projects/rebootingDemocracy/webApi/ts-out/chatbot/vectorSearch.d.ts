import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsRagVectorSearch extends PolicySynthAgentBase {
    minQualityEloRatingForChunk: number;
    minQualityEloRatingForDocument: number;
    search(userQuestion: string, routingData: PsRagRoutingResponse, dataLayout: PsIngestionDataLayout): Promise<string>;
    formatOutput(processedResults: PsRagChunk[]): string;
}
//# sourceMappingURL=vectorSearch.d.ts.map