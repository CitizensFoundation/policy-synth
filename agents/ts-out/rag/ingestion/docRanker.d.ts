import { BasePairwiseRankingsProcessor } from "../../base/basePairwiseRanking.js";
export declare class IngestionDocumentRanker extends BasePairwiseRankingsProcessor {
    rankingRules: string | undefined;
    overallTopic: string | undefined;
    constructor(memory?: PsSmarterCrowdsourcingMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankDocuments(docsToRank: PsRagDocumentSource[], rankingRules: string, overallTopic: string, eloRatingKey: string): Promise<PsRagDocumentSource[]>;
}
//# sourceMappingURL=docRanker.d.ts.map