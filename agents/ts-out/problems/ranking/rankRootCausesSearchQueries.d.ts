import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankRootCausesSearchQueriesProcessor extends BasePairwiseRankingsProcessor {
    rootCauseTypes: string[];
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankRootCausesSearchQueries.d.ts.map