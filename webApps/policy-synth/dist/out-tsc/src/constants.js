const gpt4InTokenPrice = 0.03 / 1000;
const gpt4OutTokenPrice = 0.06 / 1000;
const gpt35_16kInTokenPrice = 0.003 / 1000;
const gpt35_16kOutTokenPrice = 0.004 / 1000;
const gpt35InTokenPrice = 0.0015 / 1000;
const adaInTokenPrice = 0.0001;
const gpt35kOutTokenPrice = 0.002 / 1000;
const gpt35_16k_TPM = 750000;
const gpt35_16k_RPM = 10000;
const gpt35_TPM = 180000;
const gpt35_RPM = 3500;
const gpt4_TPM = 40000;
const gpt4_RPM = 200;
export class IEngineConstants {
    static simplifyEvidenceType(evidenceType) {
        let type = evidenceType
            .replace(/allPossible/g, "")
            .replace(/IdentifiedInTextContext/g, "");
        type = type.charAt(0).toLowerCase() + type.slice(1);
        return type;
    }
}
IEngineConstants.createSubProblemsModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 4500,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true
};
IEngineConstants.policiesSeedModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 4096,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.analyseExternalSolutionsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 256,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.createEntitiesModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 2048,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true
};
IEngineConstants.topicMapSolutionsModel = {
    inTokenCostsUSD: adaInTokenPrice
};
IEngineConstants.createSolutionImagesModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 256,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.createSearchQueriesModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
IEngineConstants.createEvidenceSearchQueriesModel = {
    name: "gpt-4",
    temperature: 0.5,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.searchQueryRankingsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
IEngineConstants.searchResultsRankingsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.subProblemsRankingsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
IEngineConstants.entitiesRankingsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
IEngineConstants.solutionsRankingsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.prosConsRankingsModel = {
    name: "gpt-3.5-turbo",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt35InTokenPrice,
    outTokenCostUSD: gpt35kOutTokenPrice,
    limitTPM: gpt35_TPM,
    limitRPM: gpt35_RPM,
    verbose: false,
};
IEngineConstants.getPageAnalysisModel = {
    name: "gpt-3.5-turbo-16k",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 16385,
    inTokenCostUSD: gpt35_16kInTokenPrice,
    outTokenCostUSD: gpt35_16kOutTokenPrice,
    limitTPM: gpt35_16k_TPM,
    limitRPM: gpt35_16k_RPM,
    verbose: false,
};
IEngineConstants.rankWebSolutionsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 4096,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.rateWebEvidenceModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 4096,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.rankWebEvidenceModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 4096,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.getRefinedEvidenceModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 1750,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.reapSolutionsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 128,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.groupSolutionsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.rateSolutionsModel = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
IEngineConstants.createSolutionsModel = {
    name: "gpt-4",
    temperature: 0.5,
    maxOutputTokens: 1200,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.evolveSolutionsModel = {
    name: "gpt-4",
    temperature: 0.5,
    maxOutputTokens: 1200,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.createProsConsModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 2048,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.evolutionMutateModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.evolutionRecombineModel = {
    name: "gpt-4",
    temperature: 0.7,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
IEngineConstants.getPageCacheExpiration = 60 * 60 * 24 * 7 * 4 * 6; // 6 months
IEngineConstants.maxSubProblems = 7;
IEngineConstants.maxNumberGeneratedOfEntities = 7;
IEngineConstants.maxStabilityRetryCount = 14;
IEngineConstants.mainLLMmaxRetryCount = 40;
IEngineConstants.limitedLLMmaxRetryCount = 10;
IEngineConstants.rankingLLMmaxRetryCount = 40;
// See also hardcoded 3 for project 1 in createSolutions
IEngineConstants.maxTopEntitiesToSearch = 4;
IEngineConstants.maxTopEntitiesToRender = 3;
IEngineConstants.maxTopQueriesToSearchPerType = 4;
IEngineConstants.maxTopEvidenceQueriesToSearchPerType = 4;
IEngineConstants.mainSearchRetryCount = 40;
IEngineConstants.maxDalleRetryCount = 7;
IEngineConstants.maxTopWebPagesToGet = 10;
IEngineConstants.maxWebPagesToGetByTopSearchPosition = 10;
IEngineConstants.maxEvidenceWebPagesToGetByTopSearchPosition = 10;
IEngineConstants.maxBingSearchResults = 10;
IEngineConstants.maxTopProsConsUsedForRating = 2;
IEngineConstants.maxNumberGeneratedProsConsForSolution = 3;
IEngineConstants.minSleepBeforeBrowserRequest = 50;
IEngineConstants.maxAdditionalRandomSleepBeforeBrowserRequest = 100;
IEngineConstants.numberOfSearchTypes = 4;
IEngineConstants.webPageNavTimeout = 60 * 1000;
IEngineConstants.currentUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
IEngineConstants.topItemsToKeepForTopicClusterPruning = 5;
IEngineConstants.chances = {
    createSolutions: {
        searchQueries: {
            useMainProblemSearchQueries: 0.01,
            useOtherSubProblemSearchQueries: 0.09,
            useSubProblemSearchQueries: 0.45,
            useRandomEntitySearchQueries: 0.45,
        },
        webSolutions: {
            top: 0.20,
            topThree: 0.45,
            topSeven: 0.25,
            all: 0.10
        },
        notUsingTopSearchQueries: 0.50,
        vectorSearchAcrossAllProblems: 0.01,
    },
};
IEngineConstants.maxTopSearchQueriesForSolutionCreation = 8;
IEngineConstants.limits = {
    webPageVectorResultsForNewSolutions: 14,
    useRandomTopFromVectorSearchResults: 14,
};
IEngineConstants.enable = {
    refine: {
        createSubProblems: true,
        createEntities: true,
        createSolutions: true,
        createProsCons: true,
        policiesSeed: true
    },
};
IEngineConstants.evolution = {
    populationSize: 80,
    limitTopTopicClusterElitesToEloRating: 850,
    // Population split
    keepElitePercent: 0.1,
    randomImmigrationPercent: 0.40,
    mutationOffspringPercent: 0.40,
    crossoverPercent: 0.1,
    // General mutation rate split
    lowMutationRate: 0.4,
    mediumMutationRate: 0.4,
    highMutationRate: 0.2,
    selectParentTournamentSize: 7,
    crossoverMutationPercent: 0.1,
};
IEngineConstants.maxPercentOfEloMatched = 0.75;
IEngineConstants.minimumNumberOfPairwiseVotesForPopulation = 8;
IEngineConstants.maxNumberOfPairwiseRankingPrompts = IEngineConstants.evolution.populationSize *
    IEngineConstants.minimumNumberOfPairwiseVotesForPopulation;
IEngineConstants.maxTopSolutionsToCreatePolicies = 3;
IEngineConstants.maxTopPoliciesToProcess = 1;
IEngineConstants.maxEvidenceToUseForRatingEvidence = 5;
IEngineConstants.policyEvidenceFieldTypes = [
    'allPossiblePositiveEvidenceIdentifiedInTextContext',
    'allPossibleNegativeEvidenceIdentifiedInTextContext',
    'allPossibleNeutralEvidenceIdentifiedInTextContext',
    'allPossibleEconomicEvidenceIdentifiedInTextContext',
    'allPossibleScientificEvidenceIdentifiedInTextContext',
    'allPossibleCulturalEvidenceIdentifiedInTextContext',
    'allPossibleEnvironmentalEvidenceIdentifiedInTextContext',
    'allPossibleLegalEvidenceIdentifiedInTextContext',
    'allPossibleTechnologicalEvidenceIdentifiedInTextContext',
    'allPossibleGeopoliticalEvidenceIdentifiedInTextContext',
    'allPossibleCaseStudiesIdentifiedInTextContext',
    'allPossibleStakeholderOpinionsIdentifiedInTextContext',
    'allPossibleExpertOpinionsIdentifiedInTextContext',
    'allPossiblePublicOpinionsIdentifiedInTextContext',
    'allPossibleHistoricalContextIdentifiedInTextContext',
    'allPossibleEthicalConsiderationsIdentifiedInTextContext',
    'allPossibleLongTermImpactIdentifiedInTextContext',
    'allPossibleShortTermImpactIdentifiedInTextContext',
    'allPossibleLocalPerspectiveIdentifiedInTextContext',
    'allPossibleGlobalPerspectiveIdentifiedInTextContext',
    'allPossibleCostAnalysisIdentifiedInTextContext',
    'allPossibleImplementationFeasibilityIdentifiedInTextContext'
];
//# sourceMappingURL=constants.js.map