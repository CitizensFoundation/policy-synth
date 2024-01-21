export declare class IEngineConstants {
    static createSubProblemsModel: IEngineBaseAIModelConstants;
    static policiesSeedModel: IEngineBaseAIModelConstants;
    static analyseExternalSolutionsModel: IEngineBaseAIModelConstants;
    static createEntitiesModel: IEngineBaseAIModelConstants;
    static topicMapSolutionsModel: {
        inTokenCostsUSD: number;
    };
    static createSolutionImagesModel: IEngineBaseAIModelConstants;
    static createSearchQueriesModel: IEngineBaseAIModelConstants;
    static createEvidenceSearchQueriesModel: IEngineBaseAIModelConstants;
    static createRootCauseSearchQueriesModel: IEngineBaseAIModelConstants;
    static searchQueryRankingsModel: IEngineBaseAIModelConstants;
    static searchResultsRankingsModel: IEngineBaseAIModelConstants;
    static subProblemsRankingsModel: IEngineBaseAIModelConstants;
    static entitiesRankingsModel: IEngineBaseAIModelConstants;
    static solutionsRankingsModel: IEngineBaseAIModelConstants;
    static prosConsRankingsModel: IEngineBaseAIModelConstants;
    static getPageAnalysisModel: IEngineBaseAIModelConstants;
    static getSolutionsPagesAnalysisModel: IEngineBaseAIModelConstants;
    static rankWebSolutionsModel: IEngineBaseAIModelConstants;
    static reduceSubProblemsModel: IEngineBaseAIModelConstants;
    static rateWebEvidenceModel: IEngineBaseAIModelConstants;
    static rateWebRootCausesModel: IEngineBaseAIModelConstants;
    static rankWebEvidenceModel: IEngineBaseAIModelConstants;
    static rankWebRootCausesModel: IEngineBaseAIModelConstants;
    static getRefinedEvidenceModel: IEngineBaseAIModelConstants;
    static getRefinedRootCausesModel: IEngineBaseAIModelConstants;
    static reapSolutionsModel: IEngineBaseAIModelConstants;
    static groupSolutionsModel: IEngineBaseAIModelConstants;
    static rateSolutionsModel: IEngineBaseAIModelConstants;
    static createSolutionsModel: IEngineBaseAIModelConstants;
    static evolveSolutionsModel: IEngineBaseAIModelConstants;
    static createProsConsModel: IEngineBaseAIModelConstants;
    static evolutionMutateModel: IEngineBaseAIModelConstants;
    static evolutionRecombineModel: IEngineBaseAIModelConstants;
    static validationModel: IEngineBaseAIModelConstants;
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