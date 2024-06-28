import { ProblemsSmarterCrowdsourcingAgent } from "../../scBaseProblemsAgent.js";
export declare class CreateSubProblemsProcessor extends ProblemsSmarterCrowdsourcingAgent {
    renderRefinePrompt(results: PsSubProblem[]): Promise<PsModelMessage[]>;
    renderCreatePrompt(): Promise<PsModelMessage[]>;
    createSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblems.d.ts.map