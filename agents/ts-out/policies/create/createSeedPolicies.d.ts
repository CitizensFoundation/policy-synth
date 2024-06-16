import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateSeedPoliciesProcessor extends BaseProblemSolvingAgent {
    renderCurrentSolution(solution: PsSolution): string;
    renderCreatePrompt(subProblemIndex: number, solution: PsSolution): Promise<(HumanMessage | SystemMessage)[]>;
    renderRefinePrompt(subProblemIndex: number, solution: PsSolution, policyProposalsToRefine: PSPolicy[]): Promise<(HumanMessage | SystemMessage)[]>;
    renderChoosePrompt(subProblemIndex: number, solution: PsSolution, policyProposalsToChooseFrom: PSPolicy[]): Promise<(HumanMessage | SystemMessage)[]>;
    createSeedPolicyForSolution(populationIndex: number, subProblemIndex: number, solution: PsSolution, solutionIndex: number): Promise<PSPolicy>;
    createSeedPolicies(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSeedPolicies.d.ts.map