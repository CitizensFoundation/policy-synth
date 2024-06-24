import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { BaseMessage } from "@langchain/core/messages";
export declare class CreateSubProblemsProcessor extends BaseProblemSolvingAgent {
    renderRefinePrompt(results: PsSubProblem[]): Promise<BaseMessage[]>;
    renderCreatePrompt(): Promise<BaseMessage[]>;
    createSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblems.d.ts.map