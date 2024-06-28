import { ProblemsSmarterCrowdsourcingAgent } from "../../scBaseProblemsAgent.js";
export declare class ReduceSubProblemsProcessor extends ProblemsSmarterCrowdsourcingAgent {
    renderSelectPrompt(problemStatement: string, subProblemsToConsider: PsSubProblem[]): Promise<PsModelMessage[]>;
    reduceSubProblems(subProblemsToConsider: PsSubProblem[]): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reduceSubProblems.d.ts.map