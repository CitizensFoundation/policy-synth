import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class RateSolutionsProcessor extends BaseProblemSolvingAgent {
    renderRatePrompt(subProblemIndex: number, solution: PsSolution): Promise<(SystemMessage | HumanMessage)[]>;
    rateSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateSolutions.d.ts.map