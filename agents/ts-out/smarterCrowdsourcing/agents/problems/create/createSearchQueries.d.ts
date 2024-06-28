import { ProblemsSmarterCrowdsourcingAgent } from "../../scBaseProblemsAgent.js";
export declare class CreateSearchQueriesProcessor extends ProblemsSmarterCrowdsourcingAgent {
    useLanguage: string | undefined;
    renderCommonPromptSection(): string;
    renderProblemPrompt(problem: string): Promise<PsModelMessage[]>;
    renderEntityPrompt(problem: string, entity: PsAffectedEntity): Promise<PsModelMessage[]>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSearchQueries.d.ts.map