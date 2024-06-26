import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
export declare class CreateSubProblemsProcessor extends BaseSmarterCrowdsourcingAgent {
    renderRefinePrompt(results: PsSubProblem[]): Promise<PsModelMessage[]>;
    renderCreatePrompt(): Promise<PsModelMessage[]>;
    createSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblems.d.ts.map