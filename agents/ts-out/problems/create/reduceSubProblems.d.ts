import { BaseProblemSolvingAgent } from "../../base/baseProblemSolvingAgent.js";
import { HumanMessage } from "@langchain/core/messages";
export declare class ReduceSubProblemsProcessor extends BaseProblemSolvingAgent {
    renderSelectPrompt(problemStatement: string, subProblemsToConsider: PsSubProblem[]): Promise<HumanMessage[]>;
    reduceSubProblems(subProblemsToConsider: PsSubProblem[]): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reduceSubProblems.d.ts.map