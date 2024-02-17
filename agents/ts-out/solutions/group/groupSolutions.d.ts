import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class GroupSolutionsProcessor extends BaseProblemSolvingAgent {
    renderGroupPrompt(solutionsToGroup: IEngineSolutionForGroupCheck[]): Promise<(HumanMessage | SystemMessage)[]>;
    groupSolutionsForSubProblem(subProblemIndex: number, solutions: Array<IEngineSolution>): Promise<void>;
    calculateGroupStats(solutions: Array<IEngineSolution>): Promise<void>;
    groupSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=groupSolutions.d.ts.map