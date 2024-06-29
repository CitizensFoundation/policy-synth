import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export declare class RankWebSolutionsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    processSubProblem(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebSolutions.d.ts.map