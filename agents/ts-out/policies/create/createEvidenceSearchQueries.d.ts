import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class CreateEvidenceSearchQueriesProcessor extends BaseProlemSolvingAgent {
    static evidenceWebPageTypesArray: PSEvidenceWebPageTypes[];
    filterPolicyParameters(policy: PSPolicy): Omit<PSPolicy, "imageUrl" | "imagePrompt" | "solutionIndex">;
    renderCreatePrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes): Promise<(HumanMessage | SystemMessage)[]>;
    renderRefinePrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRefine: string[]): Promise<(HumanMessage | SystemMessage)[]>;
    renderRankPrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRank: string[]): Promise<(HumanMessage | SystemMessage)[]>;
    lastPopulationIndex(subProblemIndex: number): number;
    createEvidenceSearchQueries(policy: PSPolicy, subProblemIndex: number, policyIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEvidenceSearchQueries.d.ts.map