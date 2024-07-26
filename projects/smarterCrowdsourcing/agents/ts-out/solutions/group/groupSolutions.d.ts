import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
export declare class GroupSolutionsAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    renderGroupPrompt(solutionsToGroup: PsSolutionForGroupCheck[]): Promise<PsModelMessage[]>;
    groupSolutionsForSubProblem(subProblemIndex: number, solutions: Array<PsSolution>): Promise<void>;
    calculateGroupStats(solutions: Array<PsSolution>): Promise<void>;
    groupSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=groupSolutions.d.ts.map