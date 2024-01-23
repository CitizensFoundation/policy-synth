import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class GroupSolutionsProcessor extends BaseProcessor {
    renderGroupPrompt(solutionsToGroup: IEngineSolutionForGroupCheck[]): Promise<(SystemMessage | HumanMessage)[]>;
    groupSolutionsForSubProblem(subProblemIndex: number, solutions: Array<IEngineSolution>): Promise<void>;
    calculateGroupStats(solutions: Array<IEngineSolution>): Promise<void>;
    groupSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=groupSolutions.d.ts.map