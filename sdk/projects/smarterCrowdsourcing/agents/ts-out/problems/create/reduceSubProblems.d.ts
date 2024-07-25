import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";
export declare class ReduceSubProblemsAgent extends ProblemsSmarterCrowdsourcingAgent {
    renderSelectPrompt(problemStatement: string, subProblemsToConsider: PsSubProblem[]): Promise<PsModelMessage[]>;
    reduceSubProblems(subProblemsToConsider: PsSubProblem[]): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reduceSubProblems.d.ts.map