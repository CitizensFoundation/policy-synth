import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankWebSolutionsProcessor extends BasePairwiseRankingsProcessor {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    processSubProblem(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebSolutions.d.ts.map