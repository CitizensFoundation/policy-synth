import { SimplePairwiseRankingsAgent } from "../../base/simplePairwiseRanking.js";
export declare class IngestionDocumentRanker extends SimplePairwiseRankingsAgent {
    rankingRules: string | undefined;
    overallTopic: string | undefined;
    constructor(memory?: PsSimpleAgentMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankDocuments(docsToRank: PsRagDocumentSource[], rankingRules: string, overallTopic: string, eloRatingKey: string): Promise<PsRagDocumentSource[]>;
}
//# sourceMappingURL=docRanker.d.ts.map