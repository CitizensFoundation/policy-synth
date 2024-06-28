import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../scPairwiseAgent.js";
export declare class RankSolutionsProcessor extends BaseSmarterCrowdsourcingPairwiseAgent {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    processSubProblem(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSolutions.d.ts.map