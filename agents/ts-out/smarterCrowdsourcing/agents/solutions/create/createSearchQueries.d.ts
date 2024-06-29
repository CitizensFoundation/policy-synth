import { SolutionsWebResearchSmarterCrowdsourcingAgent } from "../../scBaseSolutionsWebResearchAgent.js";
export declare class CreateSearchQueriesProcessor extends SolutionsWebResearchSmarterCrowdsourcingAgent {
    useLanguage: string | undefined;
    renderCommonPromptSection(): string;
    renderProblemPrompt(problem: string): Promise<PsModelMessage[]>;
    renderEntityPrompt(problem: string, entity: PsAffectedEntity): Promise<PsModelMessage[]>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSearchQueries.d.ts.map