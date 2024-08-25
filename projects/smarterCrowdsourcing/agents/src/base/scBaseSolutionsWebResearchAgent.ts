import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsClassScAgentType } from "./agentTypes.js";
import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";

export abstract class SolutionsWebResearchSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
  private static readonly SOLUTIONS_WEB_RESEARCH_AGENT_CLASS_BASE_ID =
    "c155d8f1-5efa-cb1d-8526-7d48a341f163";

  private static readonly SOLUTIONS_WEB_RESEARCH_AGENT_CLASS_VERSION = 3;

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.SOLUTIONS_WEB_RESEARCH_AGENT_CLASS_BASE_ID,
      user_id: 0,
      name: "Smarter Crowdsourcing Solutions Agent",
      version: this.SOLUTIONS_WEB_RESEARCH_AGENT_CLASS_VERSION,
      available: true,
      configuration: {
        description:
          "An agent for generating and evaluating solutions in the Smarter Crowdsourcing process",
        queueName:
          PsClassScAgentType.SMARTER_CROWDSOURCING_SOLUTIONS_WEB_RESEARCH,
        imageUrl:
          "https://aoi-storage-production.citizens.is/ypGenAi/community/1/6d4368ce-ecaf-41ab-abb3-65ceadbdb2a6.png",
        iconName: "solutions",
        capabilities: [
          "solution generation",
          "solution evaluation",
          "solution refinement",
        ],
        questions: this.getConfigurationQuestions(),
        requestedAiModelSizes: ["small", "medium", "large"] as PsAiModelSize[],
        supportedConnectors: [
          "docs",
          "sheets",
          "collaboration",
          "notificationsAndChat",
        ] as PsConnectorClassTypes[],
      } as PsAgentClassAttributesConfiguration,
    };
  }

  static getConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      ...this.getMainCommonConfigurationSettings(),
      ...this.getMainConfigurationSettings(),
      {
        type: "textDescription",
        text: "Advanced Configuration Settings",
      },
      ...this.getExtraCommonConfigurationQuestions(),
      ...this.getExtraConfigurationQuestions(),
    ];
  }

  static getMainConfigurationSettings() {
    return [];
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "maxTopSearchQueriesForSolutionCreation",
        type: "textField",
        subType: "number",
        value: 8,
        maxLength: 2,
        required: true,
        text: "Maximum top search queries for solution creation",
      },
      {
        uniqueId: "maxPercentOfSolutionsWebPagesToGet",
        type: "textField",
        subType: "number",
        value: 0.5,
        maxLength: 4,
        required: true,
        text: "Maximum percent of solutions web pages to get",
      },
      {
        uniqueId: "generationLanguage",
        type: "textField",
        value: "",
        maxLength: 50,
        required: false,
        text: "Generation language (default: English)",
      },
    ];
  }

  get maxTopSearchQueriesForSolutionCreation() {
    return this.getConfig("maxTopSearchQueriesForSolutionCreation", 8);
  }

  get maxPercentOfSolutionsWebPagesToGet() {
    return this.getConfig("maxPercentOfSolutionsWebPagesToGet", 0.5);
  }

  get generationLanguage() {
    return this.getConfig("generationLanguage", "");
  }
}
