import { SolutionsSmarterCrowdsourcingAgent } from "../../scBaseSolutionsAgent.js";
export declare class RateSolutionsProcessor extends SolutionsSmarterCrowdsourcingAgent {
    renderRatePrompt(subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    rateSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateSolutions.d.ts.map