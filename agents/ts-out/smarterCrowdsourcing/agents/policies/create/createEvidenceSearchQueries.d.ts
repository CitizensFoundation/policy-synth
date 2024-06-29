import { BaseSmarterCrowdsourcingAgent } from "../../base/scBaseAgent.js";
export declare class CreateEvidenceSearchQueriesAgent extends BaseSmarterCrowdsourcingAgent {
    static evidenceWebPageTypesArray: PSEvidenceWebPageTypes[];
    filterPolicyParameters(policy: PSPolicy): Omit<PSPolicy, "imageUrl" | "imagePrompt" | "solutionIndex">;
    renderCreatePrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes): Promise<PsModelMessage[]>;
    renderRefinePrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRefine: string[]): Promise<PsModelMessage[]>;
    renderRankPrompt(subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRank: string[]): Promise<PsModelMessage[]>;
    lastPopulationIndex(subProblemIndex: number): number;
    createEvidenceSearchQueries(policy: PSPolicy, subProblemIndex: number, policyIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEvidenceSearchQueries.d.ts.map