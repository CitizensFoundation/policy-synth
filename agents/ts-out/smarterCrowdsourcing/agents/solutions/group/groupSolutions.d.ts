import { SolutionsSmarterCrowdsourcingAgent } from "../../scBaseSolutionsAgent.js";
export declare class GroupSolutionsProcessor extends SolutionsSmarterCrowdsourcingAgent {
    renderGroupPrompt(solutionsToGroup: PsSolutionForGroupCheck[]): Promise<PsModelMessage[]>;
    groupSolutionsForSubProblem(subProblemIndex: number, solutions: Array<PsSolution>): Promise<void>;
    calculateGroupStats(solutions: Array<PsSolution>): Promise<void>;
    groupSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=groupSolutions.d.ts.map