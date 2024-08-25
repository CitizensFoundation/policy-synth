import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export declare class RankSolutionsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    defaultModelSize: PsAiModelSize;
    voteOnPromptPair(subProblemIndex: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    processSubProblem(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankSolutions.d.ts.map