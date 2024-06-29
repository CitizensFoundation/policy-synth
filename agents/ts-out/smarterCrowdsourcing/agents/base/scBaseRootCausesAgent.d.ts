import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
export declare abstract class RootCausesSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
    private static readonly ROOT_CAUSES_AGENT_CLASS_BASE_ID;
    private static readonly ROOT_CAUSES_AGENT_CLASS_VERSION;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getMainConfigurationSettings(): never[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    rootCauseTypes: string[];
    get numberOfRootCausesSearchQueries(): number;
    get maxTopRootCauseQueriesToSearchPerType(): number;
    get maxRootCausePercentOfSearchResultWebPagesToGet(): number;
    get maxRootCausesToUseForRatingRootCauses(): number;
    get topWebPagesToGetForRefineRootCausesScan(): number;
    get rootCauseFieldTypes(): never[];
}
//# sourceMappingURL=scBaseRootCausesAgent.d.ts.map