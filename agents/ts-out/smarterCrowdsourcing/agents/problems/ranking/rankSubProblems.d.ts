import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../pairwiseAgent.js";
export declare class RankSubProblemsProcessor extends BaseSmarterCrowdsourcingPairwiseAgent {
    subProblemIndex: number;
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSubProblems.d.ts.map