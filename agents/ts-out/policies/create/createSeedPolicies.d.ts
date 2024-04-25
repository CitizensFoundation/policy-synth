import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateSeedPoliciesProcessor extends BaseProblemSolvingAgent {
    renderCurrentSolution(solution: IEngineSolution): string;
    renderCreatePrompt(subProblemIndex: number, solution: IEngineSolution): Promise<(HumanMessage | SystemMessage)[]>;
    renderRefinePrompt(subProblemIndex: number, solution: IEngineSolution, policyProposalsToRefine: PSPolicy[]): Promise<(HumanMessage | SystemMessage)[]>;
    renderChoosePrompt(subProblemIndex: number, solution: IEngineSolution, policyProposalsToChooseFrom: PSPolicy[]): Promise<(HumanMessage | SystemMessage)[]>;
    createSeedPolicyForSolution(populationIndex: number, subProblemIndex: number, solution: IEngineSolution, solutionIndex: number): Promise<PSPolicy>;
    createSeedPolicies(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSeedPolicies.d.ts.map