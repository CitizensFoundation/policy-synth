import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankSolutionsProcessor extends BasePairwiseRankingsProcessor {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    processSubProblem(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSolutions.d.ts.map