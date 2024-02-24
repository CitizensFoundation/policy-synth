import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class RateSolutionsProcessor extends BaseProblemSolvingAgent {
    renderRatePrompt(subProblemIndex: number, solution: IEngineSolution): Promise<(HumanMessage | SystemMessage)[]>;
    rateSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateSolutions.d.ts.map