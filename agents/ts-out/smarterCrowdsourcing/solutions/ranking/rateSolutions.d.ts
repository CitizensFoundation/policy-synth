import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
export declare class RateSolutionsProcessor extends BaseSmarterCrowdsourcingAgent {
    renderRatePrompt(subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    rateSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateSolutions.d.ts.map