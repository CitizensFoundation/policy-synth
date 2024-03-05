import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class IngestionDocumentRanker extends BasePairwiseRankingsProcessor {
    rankingRules: string | undefined;
    overallTopic: string | undefined;
    constructor(memory?: PsBaseMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankDocuments(docsToRank: CachedFileMetadata[], rankingRules: string, overallTopic: string): Promise<CachedFileMetadata[]>;
}
//# sourceMappingURL=docRanker.d.ts.map