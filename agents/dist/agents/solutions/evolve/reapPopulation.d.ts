import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class ReapSolutionsProcessor extends BaseProcessor {
    renderReapPrompt(solution: IEngineSolution): Promise<(SystemMessage | HumanMessage)[]>;
    reapSolutionsForSubProblem(subProblemIndex: number, solutions: Array<IEngineSolution>): Promise<void>;
    reapSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reapPopulation.d.ts.map