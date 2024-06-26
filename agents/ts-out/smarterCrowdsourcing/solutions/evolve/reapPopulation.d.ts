import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
export declare class ReapSolutionsProcessor extends BaseSmarterCrowdsourcingAgent {
    renderReapPrompt(solution: PsSolution): Promise<PsModelMessage[]>;
    reapSolutionsForSubProblem(subProblemIndex: number, solutions: Array<PsSolution>): Promise<void>;
    reapSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reapPopulation.d.ts.map