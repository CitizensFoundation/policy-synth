import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
export class ProblemsSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
    static PROBLEMS_AGENT_CLASS_BASE_ID = "3f9f7a9f-98f4-4e54-8bf8-5936b82e5bd3";
    static PROBLEMS_AGENT_CLASS_VERSION = 1;
    static getAgentClass() {
        return {
            class_base_id: this.PROBLEMS_AGENT_CLASS_BASE_ID,
            user_id: 0,
            name: "Smarter Crowdsourcing Problems Agent",
            version: this.PROBLEMS_AGENT_CLASS_VERSION,
            available: true,
            configuration: {
                description: "An agent for identifying and analyzing problems in the Smarter Crowdsourcing process",
                queueName: PsClassScAgentType.SMARTER_CROWDSOURCING_PROBLEMS_PREPERATION,
                imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/08d596cf-290e-4a1b-abff-74a305e3dbbb.png",
                iconName: "problems",
                capabilities: [
                    "problem identification",
                    "root cause analysis",
                    "sub-problem generation",
                ],
                inputJsonInterface: "{}",
                outputJsonInterface: "{}",
                questions: this.getConfigurationQuestions(),
                supportedConnectors: [],
            },
        };
    }
    static getMainConfigurationSettings() {
        return [];
    }
    static getExtraConfigurationQuestions() {
        return [
            {
                uniqueId: "subProblemsRankingMinNumberOfMatches",
                type: "number",
                value: 10,
                maxLength: 3,
                required: true,
                text: "Sub-problems ranking minimum number of matches",
            },
            {
                uniqueId: "createEntitiesRefinedEnabled",
                type: "boolean",
                value: true,
                required: true,
                text: "Enable refined entity creation",
            },
            {
                uniqueId: "createSubProblemsRefineEnabled",
                type: "boolean",
                value: true,
                required: true,
                text: "Enable sub-problems refinement",
            }
        ];
    }
    // Problems-specific configuration options
    get subProblemsRankingMinNumberOfMatches() {
        return this.getConfig("subProblemsRankingMinNumberOfMatches", 10);
    }
    get rootCauseFieldTypes() {
        return this.getConfig("rootCauseFieldTypes", []);
    }
    get createEntitiesRefinedEnabled() {
        return this.getConfig("createEntitiesRefinedEnabled", true);
    }
    get createSubProblemsRefineEnabled() {
        return this.getConfig("createSubProblemsRefineEnabled", true);
    }
}
//# sourceMappingURL=scBaseProblemsAgent.js.map