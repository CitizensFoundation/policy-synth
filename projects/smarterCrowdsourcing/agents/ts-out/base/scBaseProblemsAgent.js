import { PsClassScAgentType } from "./agentTypes.js";
import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
export class ProblemsSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
    static PROBLEMS_AGENT_CLASS_BASE_ID = "3f9f7a9f-98f4-4e54-8bf8-5936b82e5bd3";
    static PROBLEMS_AGENT_CLASS_VERSION = 3;
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
                questions: this.getConfigurationQuestions(),
                requestedAiModelSizes: ["small", "medium", "large"],
                supportedConnectors: [
                    "docs",
                    "sheets",
                    "collaboration",
                    "notificationsAndChat",
                ],
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
                type: "textField",
                subType: "number",
                value: 10,
                maxLength: 3,
                required: true,
                text: "Sub-problems ranking minimum number of matches",
            },
            {
                uniqueId: "createEntitiesRefinedEnabled",
                type: "checkbox",
                value: true,
                required: true,
                text: "Enable refined entity creation",
            },
            {
                uniqueId: "skipSubProblemCreation",
                type: "checkbox",
                value: false,
                required: true,
                text: "Skip sub problem creation",
            },
            {
                uniqueId: "createSubProblemsRefineEnabled",
                type: "checkbox",
                value: true,
                required: true,
                text: "Enable sub-problems refinement",
            },
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
    get skipSubProblemCreation() {
        return this.getConfig("skipSubProblemCreation", false);
    }
}
//# sourceMappingURL=scBaseProblemsAgent.js.map