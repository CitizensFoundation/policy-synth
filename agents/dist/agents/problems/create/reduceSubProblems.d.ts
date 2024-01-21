import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage } from "langchain/schema";
export declare class ReduceSubProblemsProcessor extends BaseProcessor {
    renderSelectPrompt(problemStatement: string, subProblemsToConsider: IEngineSubProblem[]): Promise<HumanMessage[]>;
    reduceSubProblems(subProblemsToConsider: IEngineSubProblem[]): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reduceSubProblems.d.ts.map