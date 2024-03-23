import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class ReapSolutionsProcessor extends BaseProblemSolvingAgent {
    renderReapPrompt(solution: IEngineSolution): Promise<(HumanMessage | SystemMessage)[]>;
    reapSolutionsForSubProblem(subProblemIndex: number, solutions: Array<IEngineSolution>): Promise<void>;
    reapSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reapPopulation.d.ts.map