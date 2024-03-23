import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { BaseMessage } from "@langchain/core/messages";
export declare class CreateSubProblemsProcessor extends BaseProblemSolvingAgent {
    renderRefinePrompt(results: IEngineSubProblem[]): Promise<BaseMessage[]>;
    renderCreatePrompt(): Promise<BaseMessage[]>;
    createSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblems.d.ts.map