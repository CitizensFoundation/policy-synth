import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsClassScAgentType } from "./agentTypes.js";
import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";

export abstract class SolutionsEvolutionSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
  private static readonly SOLUTIONS_EVOLUTION_AGENT_CLASS_BASE_ID =
    "b2a5d8f1-5e8a-4b1d-8c2c-7d45e3b1f123";

  private static readonly SOLUTIONS_EVOLUTION_AGENT_CLASS_VERSION = 3;

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.SOLUTIONS_EVOLUTION_AGENT_CLASS_BASE_ID,
      user_id: 0,
      name: "Smarter Crowdsourcing Solutions Evolution Agent",
      version: this.SOLUTIONS_EVOLUTION_AGENT_CLASS_VERSION,
      available: true,
      configuration: {
        description:
          "An agent for evolving solutions in the Smarter Crowdsourcing process",
        queueName: PsClassScAgentType.SMARTER_CROWDSOURCING_SOLUTIONS_EVOLUTION,
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

  static getMainConfigurationSettings(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "createSolutionsInstructions",
        type: "textField",
        value: `1. Never create solution components in the form of frameworks or holistic approaches
2. Solution components should include only one core idea
3. Remember that the main facilitator for implementation will be governments.
4. Frame solution components with the intention of convincing politicians and governments to put them into action.
5. The solution component title should indicate the benefits or results of implementing the solution component.`,
        maxLength: 1000,
        required: true,
        rows: 5,
        charCounter: true,
        text: "Create Solutions Instructions",
      },
      {
        uniqueId: "rankSolutionsInstructions",
        type: "textField",
        value: `1. Solution components will be included in larger policy recommendations to governments around the world.
`,
        maxLength: 1000,
        required: true,
        rows: 5,
        charCounter: true,
        text: "Rank Solutions Instructions",
      },
      {
        uniqueId: "rateSolutionsJsonFormat",
        type: "textField",
        value: `{
    highPriorityRatings: {
      howImportantToProblem,
      howInnovative,
      howPractical,
      howEthical,
      howComplex,
    },
    otherRatings: {
      benefitsForCitizens,
      benefitsForGovernments,
      benefitsForCivilSociety,
      benefitsForPolicitians,
      benefitsForPrivateSector,
    }
  }
`,
        maxLength: 1000,
        required: true,
        rows: 10,
        charCounter: true,
        text: "Rate Solutions JSON Format",
      },
      {
        uniqueId: "reapSolutionsInstructions",
        type: "textField",
        value: `1. Solution components should not include more than one core idea.
  2. Solution components can have more than one implementation detail ideas.
  3. If the solution components has two core ideas that are hard to implement without each other then the solution component can be included.
  4. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
  5. Core ideas are distinct concepts or strategies that are central to the solution component.
`,
        maxLength: 1000,
        required: true,
        rows: 5,
        charCounter: true,
        text: "Reap Solutions Instructions",
      },
      {
        uniqueId: "rateSolutionsInstructions",
        type: "textField",
        value: ``,
        maxLength: 1000,
        required: true,
        rows: 5,
        charCounter: true,
        text: "Rate Solutions Instructions",
      },
      {
        uniqueId: "skipImageCreation",
        type: "checkbox",
        value: false,
        required: true,
        text: "Skip image creation",
      },
    ];
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "topItemsToKeepForTopicClusterPruning",
        type: "textField",
        subType: "number",
        value: 3,
        maxLength: 2,
        required: true,
        text: "Top items to keep for topic cluster pruning",
      },
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
        uniqueId: "createSolutionsNotUsingTopSearchQueriesChance",
        type: "textField",
        subType: "number",
        value: 0.1,
        maxLength: 4,
        required: true,
        text: "Chance of creating solutions not using top search queries",
      },
      {
        uniqueId: "createSolutionsWebSolutionsTopChance",
        type: "textField",
        subType: "number",
        value: 0.05,
        maxLength: 4,
        required: true,
        text: "Chance of creating top web solutions",
      },
      {
        uniqueId: "createSolutionsWebSolutionsTopThreeChance",
        type: "textField",
        subType: "number",
        value: 0.25,
        maxLength: 4,
        required: true,
        text: "Chance of creating top three web solutions",
      },
      {
        uniqueId: "createSolutionsWebSolutionsTopSevenChance",
        type: "textField",
        subType: "number",
        value: 0.5,
        maxLength: 4,
        required: true,
        text: "Chance of creating top seven web solutions",
      },
      {
        uniqueId: "createSolutionsVectorSearchAcrossAllProblemsChance",
        type: "textField",
        subType: "number",
        value: 0.001,
        maxLength: 5,
        required: true,
        text: "Chance of vector search across all problems for solution creation",
      },
      {
        uniqueId: "useRandomTopFromVectorSearchResultsLimits",
        type: "textField",
        subType: "number",
        value: 14,
        maxLength: 3,
        required: true,
        text: "Limit for using random top from vector search results",
      },
      {
        uniqueId:
          "createSolutionsSearchQueriesUseMainProblemSearchQueriesChance",
        type: "textField",
        subType: "number",
        value: 0.01,
        maxLength: 4,
        required: true,
        text: "Chance of using main problem search queries for solution creation",
      },
      {
        uniqueId:
          "createSolutionsSearchQueriesUseOtherSubProblemSearchQueriesChance",
        type: "textField",
        subType: "number",
        value: 0.01,
        maxLength: 4,
        required: true,
        text: "Chance of using other sub-problem search queries for solution creation",
      },
      {
        uniqueId:
          "createSolutionsSearchQueriesUseSubProblemSearchQueriesChance",
        type: "textField",
        subType: "number",
        value: 0.38,
        maxLength: 4,
        required: true,
        text: "Chance of using sub-problem search queries for solution creation",
      },
      {
        uniqueId: "createSolutionsRefineEnabled",
        type: "checkbox",
        value: true,
        required: true,
        text: "Enable solution refinement",
      },
      {
        uniqueId: "createProsConsRefinedEnabled",
        type: "checkbox",
        value: true,
        required: true,
        text: "Enable refined pros/cons creation",
      },
      {
        uniqueId: "evolutionPopulationSize",
        type: "textField",
        subType: "number",
        value: 80,
        maxLength: 3,
        required: true,
        text: "Evolution population size",
      },
      {
        uniqueId: "evolutionLimitTopTopicClusterElitesToEloRating",
        type: "textField",
        subType: "number",
        value: 850,
        maxLength: 4,
        required: true,
        text: "Evolution limit for top topic cluster elites Elo rating",
      },
      {
        uniqueId: "evolutionKeepElitePercent",
        type: "textField",
        subType: "number",
        value: 0.1,
        maxLength: 4,
        required: true,
        text: "Evolution keep elite percent",
      },
      {
        uniqueId: "evolutionRandomImmigrationPercent",
        type: "textField",
        subType: "number",
        value: 0.4,
        maxLength: 4,
        required: true,
        text: "Evolution random immigration percent",
      },
      {
        uniqueId: "evolutionMutationOffspringPercent",
        type: "textField",
        subType: "number",
        value: 0.35,
        maxLength: 4,
        required: true,
        text: "Evolution mutation offspring percent",
      },
      {
        uniqueId: "evolutionCrossoverPercent",
        type: "textField",
        subType: "number",
        value: 0.15,
        maxLength: 4,
        required: true,
        text: "Evolution crossover percent",
      },
      {
        uniqueId: "evolutionLowMutationRate",
        type: "textField",
        subType: "number",
        value: 0.5,
        maxLength: 4,
        required: true,
        text: "Evolution low mutation rate",
      },
      {
        uniqueId: "evolutionMediumMutationRate",
        type: "textField",
        subType: "number",
        value: 0.3,
        maxLength: 4,
        required: true,
        text: "Evolution medium mutation rate",
      },
      {
        uniqueId: "evolutionHighMutationRate",
        type: "textField",
        subType: "number",
        value: 0.2,
        maxLength: 4,
        required: true,
        text: "Evolution high mutation rate",
      },
      {
        uniqueId: "evolutionSelectParentTournamentSize",
        type: "textField",
        subType: "number",
        value: 7,
        maxLength: 2,
        required: true,
        text: "Evolution select parent tournament size",
      },
      {
        uniqueId: "evolutionCrossoverMutationPercent",
        type: "textField",
        subType: "number",
        value: 0.05,
        maxLength: 4,
        required: true,
        text: "Evolution crossover mutation percent",
      },
      {
        uniqueId: "maxPercentOfEloMatched",
        type: "textField",
        subType: "number",
        value: 0.75,
        maxLength: 4,
        required: true,
        text: "Maximum percent of Elo matched",
      },
      {
        uniqueId: "minimumNumberOfPairwiseVotesForPopulation",
        type: "textField",
        subType: "number",
        value: 10,
        maxLength: 3,
        required: true,
        text: "Minimum number of pairwise votes for population",
      },
      {
        uniqueId: "customInstructionsRankSolutions",
        type: "textField",
        value: "",
        maxLength: 1000,
        required: false,
        rows: 5,
        charCounter: true,
        text: "Custom instructions for ranking solutions",
      },
    ];
  }

  get rateSolutionsInstructions() {
    return this.getConfig("rateSolutionsInstructions", "");
  }

  get rateSolutionsJsonFormat() {
    return this.getConfig("rateSolutionsJsonFormat", "");
  }

  get reapSolutionsInstructions() {
    return this.getConfig("reapSolutionsInstructions", "");
  }

  get createSolutionsInstructions() {
    return this.getConfig("createSolutionsInstructions", "");
  }

  get rankSolutionsInstructions() {
    return this.getConfig("rankSolutionsInstructions", "");
  }

  // Solutions-specific configuration options
  get topItemsToKeepForTopicClusterPruning() {
    return this.getConfig("topItemsToKeepForTopicClusterPruning", 3);
  }
  get maxTopSearchQueriesForSolutionCreation() {
    return this.getConfig("maxTopSearchQueriesForSolutionCreation", 8);
  }

  get createSolutionsNotUsingTopSearchQueriesChance() {
    return this.getConfig("createSolutionsNotUsingTopSearchQueriesChance", 0.1);
  }
  get createSolutionsWebSolutionsTopChance() {
    return this.getConfig("createSolutionsWebSolutionsTopChance", 0.05);
  }
  get createSolutionsWebSolutionsTopThreeChance() {
    return this.getConfig("createSolutionsWebSolutionsTopThreeChance", 0.25);
  }
  get createSolutionsWebSolutionsTopSevenChance() {
    return this.getConfig("createSolutionsWebSolutionsTopSevenChance", 0.5);
  }
  get createSolutionsVectorSearchAcrossAllProblemsChance() {
    return this.getConfig(
      "createSolutionsVectorSearchAcrossAllProblemsChance",
      0.001
    );
  }
  get useRandomTopFromVectorSearchResultsLimits() {
    return this.getConfig("useRandomTopFromVectorSearchResultsLimits", 14);
  }
  get createSolutionsSearchQueriesUseMainProblemSearchQueriesChance() {
    return this.getConfig(
      "createSolutionsSearchQueriesUseMainProblemSearchQueriesChance",
      0.01
    );
  }
  get createSolutionsSearchQueriesUseOtherSubProblemSearchQueriesChance() {
    return this.getConfig(
      "createSolutionsSearchQueriesUseOtherSubProblemSearchQueriesChance",
      0.01
    );
  }
  get createSolutionsSearchQueriesUseSubProblemSearchQueriesChance() {
    return this.getConfig(
      "createSolutionsSearchQueriesUseSubProblemSearchQueriesChance",
      0.38
    );
  }
  get createSolutionsRefineEnabled() {
    return this.getConfig("createSolutionsRefineEnabled", true);
  }
  get createProsConsRefinedEnabled() {
    return this.getConfig("createProsConsRefinedEnabled", true);
  }

  // Evolution-specific configuration options
  get evolutionPopulationSize() {
    return this.getConfig("evolutionPopulationSize", 80);
  }
  get evolutionLimitTopTopicClusterElitesToEloRating() {
    return this.getConfig(
      "evolutionLimitTopTopicClusterElitesToEloRating",
      850
    );
  }
  get evolutionKeepElitePercent() {
    return this.getConfig("evolutionKeepElitePercent", 0.1);
  }
  get evolutionRandomImmigrationPercent() {
    return this.getConfig("evolutionRandomImmigrationPercent", 0.4);
  }
  get evolutionMutationOffspringPercent() {
    return this.getConfig("evolutionMutationOffspringPercent", 0.35);
  }
  get evolutionCrossoverPercent() {
    return this.getConfig("evolutionCrossoverPercent", 0.15);
  }
  get evolutionLowMutationRate() {
    return this.getConfig("evolutionLowMutationRate", 0.5);
  }
  get evolutionMediumMutationRate() {
    return this.getConfig("evolutionMediumMutationRate", 0.3);
  }
  get evolutionHighMutationRate() {
    return this.getConfig("evolutionHighMutationRate", 0.2);
  }
  get evolutionSelectParentTournamentSize() {
    return this.getConfig("evolutionSelectParentTournamentSize", 7);
  }
  get evolutionCrossoverMutationPercent() {
    return this.getConfig("evolutionCrossoverMutationPercent", 0.05);
  }

  get skipImageCreation() {
    return this.getConfig("skipImageCreation", false);
  }

  // Other configuration options
  get maxPercentOfEloMatched() {
    return this.getConfig("maxPercentOfEloMatched", 0.75);
  }
  get minimumNumberOfPairwiseVotesForPopulation() {
    return this.getConfig("minimumNumberOfPairwiseVotesForPopulation", 10);
  }
  get maxNumberOfPairwiseRankingPrompts() {
    return this.getConfig(
      "maxNumberOfPairwiseRankingPrompts",
      this.evolutionPopulationSize *
        this.minimumNumberOfPairwiseVotesForPopulation
    );
  }
  get customInstructionsRankSolutions() {
    return this.getConfig("customInstructionsRankSolutions", "");
  }
}
