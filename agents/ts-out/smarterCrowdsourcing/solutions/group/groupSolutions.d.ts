import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class GroupSolutionsProcessor extends BaseProblemSolvingAgent {
    renderGroupPrompt(solutionsToGroup: PsSolutionForGroupCheck[]): Promise<(SystemMessage | HumanMessage)[]>;
    groupSolutionsForSubProblem(subProblemIndex: number, solutions: Array<PsSolution>): Promise<void>;
    calculateGroupStats(solutions: Array<PsSolution>): Promise<void>;
    groupSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=groupSolutions.d.ts.map