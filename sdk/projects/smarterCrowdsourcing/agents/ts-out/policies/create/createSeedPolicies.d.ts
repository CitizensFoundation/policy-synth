import { BaseSmarterCrowdsourcingAgent } from "../../base/scBaseAgent.js";
export declare class CreateSeedPoliciesAgent extends BaseSmarterCrowdsourcingAgent {
    renderCurrentSolution(solution: PsSolution): string;
    renderCreatePrompt(subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    renderRefinePrompt(subProblemIndex: number, solution: PsSolution, policyProposalsToRefine: PSPolicy[]): Promise<PsModelMessage[]>;
    renderChoosePrompt(subProblemIndex: number, solution: PsSolution, policyProposalsToChooseFrom: PSPolicy[]): Promise<PsModelMessage[]>;
    createSeedPolicyForSolution(populationIndex: number, subProblemIndex: number, solution: PsSolution, solutionIndex: number): Promise<PSPolicy>;
    createSeedPolicies(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSeedPolicies.d.ts.map