export declare class PsConstants {
    static createSubProblemsModel: PsBaseAIModelConstants;
    static policiesSeedModel: PsBaseAIModelConstants;
    static analyseExternalSolutionsModel: PsBaseAIModelConstants;
    static createEntitiesModel: PsBaseAIModelConstants;
    static topicMapSolutionsModel: {
        inTokenCostsUSD: number;
    };
    static createSolutionImagesModel: PsBaseAIModelConstants;
    static createSearchQueriesModel: PsBaseAIModelConstants;
    static createEvidenceSearchQueriesModel: PsBaseAIModelConstants;
    static createRootCauseSearchQueriesModel: PsBaseAIModelConstants;
    static searchQueryRankingsModel: PsBaseAIModelConstants;
    static searchResultsRankingsModel: PsBaseAIModelConstants;
    static subProblemsRankingsModel: PsBaseAIModelConstants;
    static entitiesRankingsModel: PsBaseAIModelConstants;
    static solutionsRankingsModel: PsBaseAIModelConstants;
    static prosConsRankingsModel: PsBaseAIModelConstants;
    static getPageAnalysisModel: PsBaseAIModelConstants;
    static getSolutionsPagesAnalysisModel: PsBaseAIModelConstants;
    static rankWebSolutionsModel: PsBaseAIModelConstants;
    static reduceSubProblemsModel: PsBaseAIModelConstants;
    static rateWebEvidenceModel: PsBaseAIModelConstants;
    static rateWebRootCausesModel: PsBaseAIModelConstants;
    static rankWebEvidenceModel: PsBaseAIModelConstants;
    static rankWebRootCausesModel: PsBaseAIModelConstants;
    static getRefinedEvidenceModel: PsBaseAIModelConstants;
    static getRefinedRootCausesModel: PsBaseAIModelConstants;
    static reapSolutionsModel: PsBaseAIModelConstants;
    static groupSolutionsModel: PsBaseAIModelConstants;
    static rateSolutionsModel: PsBaseAIModelConstants;
    static createSolutionsModel: PsBaseAIModelConstants;
    static evolveSolutionsModel: PsBaseAIModelConstants;
    static createProsConsModel: PsBaseAIModelConstants;
    static evolutionMutateModel: PsBaseAIModelConstants;
    static evolutionRecombineModel: PsBaseAIModelConstants;
    static validationModel: PsBaseAIModelConstants;
    static getPageCacheExpiration: number;
    static maxSubProblems: number;
    static maxNumberGeneratedOfEntities: number;
    static maxStabilityRetryCount: number;
    static mainLLMmaxRetryCount: number;
    static limitedLLMmaxRetryCount: number;
    static rankingLLMmaxRetryCount: number;
    static maxTopEntitiesToSearch: number;
    static maxTopEntitiesToRender: number;
    static maxTopQueriesToSearchPerType: number;
    static maxTopEvidenceQueriesToSearchPerType: number;
    static maxTopRootCauseQueriesToSearchPerType: number;
    static maxRootCausePercentOfSearchResultWebPagesToGet: number;
    static maxRootCausesToUseForRatingRootCauses: number;
    static topWebPagesToGetForRefineRootCausesScan: number;
    static mainSearchRetryCount: number;
    static maxDalleRetryCount: number;
    static maxTopWebPagesToGet: number;
    static maxBingSearchResults: number;
    static maxTopProsConsUsedForRating: number;
    static maxNumberGeneratedProsConsForSolution: number;
    static minSleepBeforeBrowserRequest: number;
    static maxAdditionalRandomSleepBeforeBrowserRequest: number;
    static numberOfSearchTypes: number;
    static webPageNavTimeout: number;
    static subProblemsRankingMinNumberOfMatches: number;
    static currentUserAgent: string;
    static topItemsToKeepForTopicClusterPruning: number;
    static chances: {
        createSolutions: {
            searchQueries: {
                useMainProblemSearchQueries: number;
                useOtherSubProblemSearchQueries: number;
                useSubProblemSearchQueries: number;
                useRandomEntitySearchQueries: number;
            };
            webSolutions: {
                top: number;
                topThree: number;
                topSeven: number;
                all: number;
            };
            notUsingTopSearchQueries: number;
            vectorSearchAcrossAllProblems: number;
        };
    };
    static maxTopSearchQueriesForSolutionCreation: number;
    static maxPercentOfSolutionsWebPagesToGet: number;
    static limits: {
        webPageVectorResultsForNewSolutions: number;
        useRandomTopFromVectorSearchResults: number;
    };
    static enable: {
        refine: {
            createSubProblems: boolean;
            createEntities: boolean;
            createSolutions: boolean;
            createProsCons: boolean;
            policiesSeed: boolean;
        };
    };
    static evolution: {
        populationSize: number;
        limitTopTopicClusterElitesToEloRating: number;
        keepElitePercent: number;
        randomImmigrationPercent: number;
        mutationOffspringPercent: number;
        crossoverPercent: number;
        lowMutationRate: number;
        mediumMutationRate: number;
        highMutationRate: number;
        selectParentTournamentSize: number;
        crossoverMutationPercent: number;
    };
    static maxPercentOfEloMatched: number;
    static minimumNumberOfPairwiseVotesForPopulation: number;
    static maxNumberOfPairwiseRankingPrompts: number;
    static maxTopSolutionsToCreatePolicies: number;
    static maxTopPoliciesToProcess: number;
    static maxEvidenceToUseForRatingEvidence: number;
    static policyEvidenceFieldTypes: string[];
    static rootCauseFieldTypes: string[];
    static simplifyEvidenceType(evidenceType: string): string;
    static simplifyRootCauseType(rootCauseType: string): string;
}
//# sourceMappingURL=constants.d.ts.map