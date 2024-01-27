import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class RateSolutionsProcessor extends BaseProlemSolvingAgent {
    renderRatePrompt(subProblemIndex: number, solution: IEngineSolution): Promise<(SystemMessage | HumanMessage)[]>;
    rateSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateSolutions.d.ts.map