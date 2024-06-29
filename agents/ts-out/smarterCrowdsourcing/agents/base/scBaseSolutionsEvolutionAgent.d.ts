import { BaseSmarterCrowdsourcingAgent } from "./scBaseAgent.js";
export declare abstract class SolutionsEvolutionSmarterCrowdsourcingAgent extends BaseSmarterCrowdsourcingAgent {
    private static readonly SOLUTIONS_EVOLUTION_AGENT_CLASS_BASE_ID;
    private static readonly SOLUTIONS_EVOLUTION_AGENT_CLASS_VERSION;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getConfigurationQuestions(): YpStructuredQuestionData[];
    static getMainConfigurationSettings(): YpStructuredQuestionData[];
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    get topItemsToKeepForTopicClusterPruning(): number;
    get maxTopSearchQueriesForSolutionCreation(): number;
    get createSolutionsNotUsingTopSearchQueriesChance(): number;
    get createSolutionsWebSolutionsTopChance(): number;
    get createSolutionsWebSolutionsTopThreeChance(): number;
    get createSolutionsWebSolutionsTopSevenChance(): number;
    get createSolutionsVectorSearchAcrossAllProblemsChance(): number;
    get useRandomTopFromVectorSearchResultsLimits(): number;
    get createSolutionsSearchQueriesUseMainProblemSearchQueriesChance(): number;
    get createSolutionsSearchQueriesUseOtherSubProblemSearchQueriesChance(): number;
    get createSolutionsSearchQueriesUseSubProblemSearchQueriesChance(): number;
    get createSolutionsRefineEnabled(): boolean;
    get createProsConsRefinedEnabled(): boolean;
    get evolutionPopulationSize(): number;
    get evolutionLimitTopTopicClusterElitesToEloRating(): number;
    get evolutionKeepElitePercent(): number;
    get evolutionRandomImmigrationPercent(): number;
    get evolutionMutationOffspringPercent(): number;
    get evolutionCrossoverPercent(): number;
    get evolutionLowMutationRate(): number;
    get evolutionMediumMutationRate(): number;
    get evolutionHighMutationRate(): number;
    get evolutionSelectParentTournamentSize(): number;
    get evolutionCrossoverMutationPercent(): number;
    get maxPercentOfEloMatched(): number;
    get minimumNumberOfPairwiseVotesForPopulation(): number;
    get maxNumberOfPairwiseRankingPrompts(): number;
    get customInstructionsRankSolutions(): string;
}
//# sourceMappingURL=scBaseSolutionsEvolutionAgent.d.ts.map