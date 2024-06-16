import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankSubProblemsProcessor extends BasePairwiseRankingsProcessor {
    subProblemIndex: number;
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSubProblems.d.ts.map