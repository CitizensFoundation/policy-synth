import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
export declare class CreateEvidenceSearchQueriesProcessor extends BaseProblemSolvingAgent {
    static evidenceWebPageTypesArray: PSEvidenceWebPageTypes[];
    filterPolicyParameters(policy: PSPolicy): Omit<PSPolicy, "imageUrl" | "imagePrompt" | "solutionIndex">;
    renderCreatePrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes): Promise<(SystemMessage | HumanMessage)[]>;
    renderRefinePrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRefine: string[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderRankPrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRank: string[]): Promise<(SystemMessage | HumanMessage)[]>;
    lastPopulationIndex(subProblemIndex: number): number;
    createEvidenceSearchQueries(policy: PSPolicy, subProblemIndex: number, policyIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEvidenceSearchQueries.d.ts.map