import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
export declare abstract class ProblemsSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
    private static readonly PROBLEMS_AGENT_CLASS_BASE_ID;
    private static readonly PROBLEMS_AGENT_CLASS_VERSION;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getMainConfigurationSettings(): never[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    get subProblemsRankingMinNumberOfMatches(): number;
    get rootCauseFieldTypes(): never[];
    get createEntitiesRefinedEnabled(): boolean;
    get createSubProblemsRefineEnabled(): boolean;
    get skipSubProblemCreation(): boolean;
}
//# sourceMappingURL=scBaseProblemsAgent.d.ts.map