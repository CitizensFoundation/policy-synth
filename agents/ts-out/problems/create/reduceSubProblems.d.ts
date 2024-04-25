import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage } from "@langchain/core/messages";
export declare class ReduceSubProblemsProcessor extends BaseProblemSolvingAgent {
    renderSelectPrompt(problemStatement: string, subProblemsToConsider: IEngineSubProblem[]): Promise<HumanMessage[]>;
    reduceSubProblems(subProblemsToConsider: IEngineSubProblem[]): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reduceSubProblems.d.ts.map