import { PsClassScAgentType } from "./agentTypes.js";
import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";

export abstract class RootCausesSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
  private static readonly ROOT_CAUSES_AGENT_CLASS_BASE_ID =
    "9c917a3e-9864-4e5c-abfc-19f638ac5bd5";

  private static readonly ROOT_CAUSES_AGENT_CLASS_VERSION = 1;

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.ROOT_CAUSES_AGENT_CLASS_BASE_ID,
      user_id: 0,
      name: "Smarter Crowdsourcing Problems Agent",
      version: this.ROOT_CAUSES_AGENT_CLASS_VERSION,
      available: true,
      configuration: {
        description:
          "An agent for identifying and analyzing problems in the Smarter Crowdsourcing process",
        queueName: PsClassScAgentType.SMARTER_CROWDSOURCING_ROOT_CAUSES,
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

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "maxTopRootCauseQueriesToSearchPerType",
        type: "number",
        value: 15,
        maxLength: 3,
        required: true,
        text: "Maximum top root cause queries to search per type",
      },
      {
        uniqueId: "maxRootCausePercentOfSearchResultWebPagesToGet",
        type: "number",
        value: 0.7,
        maxLength: 4,
        required: true,
        text: "Maximum root cause percent of search result web pages to get",
      },
      {
        uniqueId: "maxRootCausesToUseForRatingRootCauses",
        type: "number",
        value: 5,
        maxLength: 2,
        required: true,
        text: "Maximum root causes to use for rating root causes",
      },
      {
        uniqueId: "topWebPagesToGetForRefineRootCausesScan",
        type: "number",
        value: 100,
        maxLength: 4,
        required: true,
        text: "Top web pages to get for refine root causes scan",
      },
      {
        uniqueId: "rootCauseFieldTypes",
        type: "text",
        value: "[]",
        maxLength: 1000,
        required: true,
        rows: 5,
        charCounter: true,
        text: "Root cause field types (JSON array)",
      },
    ];
  }

  rootCauseTypes = [
    "historicalRootCause",
    "economicRootCause",
    "scientificRootCause",
    "culturalRootCause",
    "socialRootCause",
    "environmentalRootCause",
    "legalRootCause",
    "technologicalRootCause",
    "geopoliticalRootCause",
    "ethicalRootCause",
    "caseStudies",
  ];

  // Problems-specific configuration options
  get maxTopRootCauseQueriesToSearchPerType() {
    return this.getConfig("maxTopRootCauseQueriesToSearchPerType", 15);
  }
  get maxRootCausePercentOfSearchResultWebPagesToGet() {
    return this.getConfig(
      "maxRootCausePercentOfSearchResultWebPagesToGet",
      0.7
    );
  }
  get maxRootCausesToUseForRatingRootCauses() {
    return this.getConfig("maxRootCausesToUseForRatingRootCauses", 5);
  }
  get topWebPagesToGetForRefineRootCausesScan() {
    return this.getConfig("topWebPagesToGetForRefineRootCausesScan", 100);
  }

  get rootCauseFieldTypes() {
    return this.getConfig("rootCauseFieldTypes", []);
  }

}
