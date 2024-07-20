import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
export declare abstract class PoliciesSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
    private static readonly POLICIES_AGENT_CLASS_BASE_ID;
    private static readonly POLICIES_AGENT_CLASS_VERSION;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getMainConfigurationSettings(): YpStructuredQuestionData[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    get maxTopSolutionsToCreatePolicies(): number;
    get maxTopPoliciesToProcess(): number;
    get maxEvidenceToUseForRatingEvidence(): number;
    get policyEvidenceFieldTypes(): never[];
    get maxTopEvidenceQueriesToSearchPerType(): number;
}
//# sourceMappingURL=scBasePoliciesAgent.d.ts.map