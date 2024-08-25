import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export declare class RankWebSolutionsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSubProblemEntities(subProblemIndex: number): Promise<void>;
    processSubProblem(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebSolutions.d.ts.map