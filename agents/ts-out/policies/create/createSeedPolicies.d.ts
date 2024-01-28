import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class CreateSeedPoliciesProcessor extends BaseProlemSolvingAgent {
    renderCurrentSolution(solution: IEngineSolution): string;
    renderCreatePrompt(subProblemIndex: number, solution: IEngineSolution): Promise<(SystemMessage | HumanMessage)[]>;
    renderRefinePrompt(subProblemIndex: number, solution: IEngineSolution, policyProposalsToRefine: PSPolicy[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderChoosePrompt(subProblemIndex: number, solution: IEngineSolution, policyProposalsToChooseFrom: PSPolicy[]): Promise<(SystemMessage | HumanMessage)[]>;
    createSeedPolicyForSolution(populationIndex: number, subProblemIndex: number, solution: IEngineSolution, solutionIndex: number): Promise<PSPolicy>;
    createSeedPolicies(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSeedPolicies.d.ts.map