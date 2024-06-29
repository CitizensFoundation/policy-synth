import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../scBaseSolutionsEvolutionAgent.js";
export declare class ReapSolutionsProcessor extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    renderReapPrompt(solution: PsSolution): Promise<PsModelMessage[]>;
    reapSolutionsForSubProblem(subProblemIndex: number, solutions: Array<PsSolution>): Promise<void>;
    reapSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reapPopulation.d.ts.map