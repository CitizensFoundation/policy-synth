import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
export declare abstract class SolutionsWebResearchSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
    private static readonly SOLUTIONS_WEB_RESEARCH_AGENT_CLASS_BASE_ID;
    private static readonly SOLUTIONS_WEB_RESEARCH_AGENT_CLASS_VERSION;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getConfigurationQuestions(): YpStructuredQuestionData[];
    static getMainConfigurationSettings(): never[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    get maxTopSearchQueriesForSolutionCreation(): number;
    get maxPercentOfSolutionsWebPagesToGet(): number;
    get generationLanguage(): string;
}
//# sourceMappingURL=scBaseSolutionsWebResearchAgent.d.ts.map