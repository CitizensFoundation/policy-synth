import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankSubProblemsProcessor extends BasePairwiseRankingsProcessor {
    subProblemIndex: number;
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSubProblems.d.ts.map