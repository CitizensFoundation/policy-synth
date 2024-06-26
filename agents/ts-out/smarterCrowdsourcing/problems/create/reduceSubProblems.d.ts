import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
export declare class ReduceSubProblemsProcessor extends BaseSmarterCrowdsourcingAgent {
    renderSelectPrompt(problemStatement: string, subProblemsToConsider: PsSubProblem[]): Promise<PsModelMessage[]>;
    reduceSubProblems(subProblemsToConsider: PsSubProblem[]): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=reduceSubProblems.d.ts.map