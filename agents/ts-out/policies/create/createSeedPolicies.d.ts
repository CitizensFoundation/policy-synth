import { BaseProblemSolvingAgent } from "../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateSeedPoliciesProcessor extends BaseProblemSolvingAgent {
    renderCurrentSolution(solution: PsSolution): string;
    renderCreatePrompt(subProblemIndex: number, solution: PsSolution): Promise<(SystemMessage | HumanMessage)[]>;
    renderRefinePrompt(subProblemIndex: number, solution: PsSolution, policyProposalsToRefine: PSPolicy[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderChoosePrompt(subProblemIndex: number, solution: PsSolution, policyProposalsToChooseFrom: PSPolicy[]): Promise<(SystemMessage | HumanMessage)[]>;
    createSeedPolicyForSolution(populationIndex: number, subProblemIndex: number, solution: PsSolution, solutionIndex: number): Promise<PSPolicy>;
    createSeedPolicies(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSeedPolicies.d.ts.map