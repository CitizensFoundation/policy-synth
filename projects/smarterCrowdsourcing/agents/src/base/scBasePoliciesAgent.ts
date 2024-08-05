import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsClassScAgentType } from "./agentTypes.js";
import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";

export abstract class PoliciesSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
  private static readonly POLICIES_AGENT_CLASS_BASE_ID =
    "c7e6f3d2-9a1b-4d8e-b6f4-1c2d3e4f5a6b";

  private static readonly POLICIES_AGENT_CLASS_VERSION = 2;

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.POLICIES_AGENT_CLASS_BASE_ID,
      user_id: 0,
      name: "Smarter Crowdsourcing Policies Agent",
      version: this.POLICIES_AGENT_CLASS_VERSION,
      available: true,
      configuration: {
        description:
          "An agent for creating policies in the Smarter Crowdsourcing process",
        queueName: PsClassScAgentType.SMARTER_CROWDSOURCING_POLICIES,
        imageUrl:
          "https://aoi-storage-production.citizens.is/ypGenAi/community/1/b70ab7b3-7235-46b6-a3af-1a16eccee784.png",
        iconName: "problems",
        capabilities: [
          "problem identification",
          "root cause analysis",
          "sub-problem generation",
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

  static getMainConfigurationSettings(): YpStructuredQuestionData[] {
    return [];
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "maxTopSolutionsToCreatePolicies",
        type: "textField",
        subType: "number",
        value: 3,
        maxLength: 2,
        required: true,
        text: "Maximum top solutions to create policies",
      },
      {
        uniqueId: "maxTopPoliciesToProcess",
        type: "textField",
        subType: "number",
        value: 1,
        maxLength: 2,
        required: true,
        text: "Maximum top policies to process",
      },
      {
        uniqueId: "maxEvidenceToUseForRatingEvidence",
        type: "textField",
        subType: "number",
        value: 5,
        maxLength: 2,
        required: true,
        text: "Maximum evidence to use for rating evidence",
      },
      {
        uniqueId: "maxTopEvidenceQueriesToSearchPerType",
        type: "textField",
        subType: "number",
        value: 4,
        maxLength: 2,
        required: true,
        text: "Maximum top evidence queries to search per type",
      },

      {
        uniqueId: "policyEvidenceFieldTypes",
        type: "textField",
        value: JSON.stringify([
          "allPossiblePositiveEvidenceIdentifiedInTextContext",
          "allPossibleNegativeEvidenceIdentifiedInTextContext",
          "allPossibleNeutralEvidenceIdentifiedInTextContext",
          "allPossibleEconomicEvidenceIdentifiedInTextContext",
          "allPossibleScientificEvidenceIdentifiedInTextContext",
          "allPossibleCulturalEvidenceIdentifiedInTextContext",
          "allPossibleEnvironmentalEvidenceIdentifiedInTextContext",
          "allPossibleLegalEvidenceIdentifiedInTextContext",
          "allPossibleTechnologicalEvidenceIdentifiedInTextContext",
          "allPossibleGeopoliticalEvidenceIdentifiedInTextContext",
          "allPossibleCaseStudiesIdentifiedInTextContext",
          "allPossibleStakeholderOpinionsIdentifiedInTextContext",
          "allPossibleExpertOpinionsIdentifiedInTextContext",
          "allPossiblePublicOpinionsIdentifiedInTextContext",
          "allPossibleHistoricalContextIdentifiedInTextContext",
          "allPossibleEthicalConsiderationsIdentifiedInTextContext",
          "allPossibleLongTermImpactIdentifiedInTextContext",
          "allPossibleShortTermImpactIdentifiedInTextContext",
          "allPossibleLocalPerspectiveIdentifiedInTextContext",
          "allPossibleGlobalPerspectiveIdentifiedInTextContext",
          "allPossibleCostAnalysisIdentifiedInTextContext",
          "allPossibleImplementationFeasibilityIdentifiedInTextContext",
        ]),
        maxLength: 1000,
        required: true,
        rows: 5,
        charCounter: true,
        text: "Policy evidence field types (JSON array)",
      },
    ];
  }

  // Policies-specific configuration options
  get maxTopSolutionsToCreatePolicies() {
    return this.getConfig("maxTopSolutionsToCreatePolicies", 3);
  }
  get maxTopPoliciesToProcess() {
    return this.getConfig("maxTopPoliciesToProcess", 1);
  }
  get maxEvidenceToUseForRatingEvidence() {
    return this.getConfig("maxEvidenceToUseForRatingEvidence", 5);
  }
  get policyEvidenceFieldTypes() {
    return this.getConfig("policyEvidenceFieldTypes", []);
  }
  get maxTopEvidenceQueriesToSearchPerType() {
    return this.getConfig("maxTopEvidenceQueriesToSearchPerType", 4);
  }
}
