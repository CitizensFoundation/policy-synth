import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../pairwiseAgent.js";
export declare class RankWebSolutionsProcessor extends BaseSmarterCrowdsourcingPairwiseAgent {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    processSubProblem(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebSolutions.d.ts.map