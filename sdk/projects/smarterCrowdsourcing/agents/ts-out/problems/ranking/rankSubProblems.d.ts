import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export declare class RankSubProblemsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    subProblemIndex: number;
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSubProblems.d.ts.map