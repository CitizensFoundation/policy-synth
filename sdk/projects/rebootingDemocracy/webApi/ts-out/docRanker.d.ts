import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class IngestionDocumentRanker extends BasePairwiseRankingsProcessor {
    rankingRules: string | undefined;
    overallTopic: string | undefined;
    constructor(memory?: PsBaseMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankDocuments(docsToRank: DocumentSource[], rankingRules: string, overallTopic: string, eloRatingKey: string): Promise<DocumentSource[]>;
}
//# sourceMappingURL=docRanker.d.ts.map