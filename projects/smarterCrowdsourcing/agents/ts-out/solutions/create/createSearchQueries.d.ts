import { SolutionsWebResearchSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsWebResearchAgent.js";
export declare class CreateSearchQueriesAgent extends SolutionsWebResearchSmarterCrowdsourcingAgent {
    renderCommonPromptSection(): string;
    renderProblemPrompt(problem: string): Promise<PsModelMessage[]>;
    renderEntityPrompt(problem: string, entity: PsAffectedEntity): Promise<PsModelMessage[]>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSearchQueries.d.ts.map