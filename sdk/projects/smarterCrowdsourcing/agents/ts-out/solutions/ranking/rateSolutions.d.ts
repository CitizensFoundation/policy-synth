import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
export declare class RateSolutionsAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    renderRatePrompt(subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    rateSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateSolutions.d.ts.map