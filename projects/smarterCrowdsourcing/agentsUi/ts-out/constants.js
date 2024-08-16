const gpt4InTokenPrice = 0.01 / 1000;
const gpt4OutTokenPrice = 0.03 / 1000;
const gpt35_16kInTokenPrice = 0.001 / 1000;
const gpt35_16kOutTokenPrice = 0.002 / 1000;
// The total limit is 128k but we'll use the first 70k
const gpt4TotalTokenLimit = 70000;
const adaInTokenPrice = 0.0001;
const gpt35_16k_TPM = 1000000;
const gpt35_16k_RPM = 10000;
const gpt35_TPM = 750000;
const gpt35_RPM = 10000;
const gpt4_TPM = 150000;
const gpt4_RPM = 10000;
export class PsConstants {
    static simplifyEvidenceType(evidenceType) {
        let type = evidenceType.replace(/allPossible/g, "").replace(/IdentifiedInTextContext/g, "");
        type = type.charAt(0).toLowerCase() + type.slice(1);
        return type;
    }
    static simplifyRootCauseType(rootCauseType) {
        let type = rootCauseType.replace(/allPossible/g, "").replace(/IdentifiedInTextContext/g, "");
        type = type.charAt(0).toLowerCase() + type.slice(1);
        if (type != "rootCausesCaseStudies") {
            type = type.slice(0, -1);
        }
        return type;
    }
}
PsConstants.createSubProblemsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 4096,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
PsConstants.policiesSeedModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 4096,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.analyseExternalSolutionsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 256,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.createEntitiesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 2048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
PsConstants.topicMapSolutionsModel = {
    inTokenCostsUSD: adaInTokenPrice,
};
PsConstants.createSolutionImagesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 256,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.createSearchQueriesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 1024,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
PsConstants.createEvidenceSearchQueriesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.5,
    maxOutputTokens: 1024,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.createRootCauseSearchQueriesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 1024,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true
};
PsConstants.searchQueryRankingsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.searchResultsRankingsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.subProblemsRankingsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.entitiesRankingsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: true,
};
PsConstants.solutionsRankingsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
PsConstants.prosConsRankingsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.getPageAnalysisModel = {
    name: "gpt-3.5-turbo-1106",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 16385,
    inTokenCostUSD: gpt35_16kInTokenPrice,
    outTokenCostUSD: gpt35_16kOutTokenPrice,
    limitTPM: gpt35_16k_TPM,
    limitRPM: gpt35_16k_RPM,
    verbose: false,
};
PsConstants.getSolutionsPagesAnalysisModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 4000,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.rankWebSolutionsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.reduceSubProblemsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.1,
    maxOutputTokens: 4096,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
PsConstants.rateWebEvidenceModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 4096,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.rateWebRootCausesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
PsConstants.rankWebEvidenceModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.rankWebRootCausesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.getRefinedEvidenceModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.getRefinedRootCausesModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 3048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
PsConstants.reapSolutionsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 128,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.groupSolutionsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 4095,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false
};
PsConstants.rateSolutionsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 1024,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.createSolutionsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.5,
    maxOutputTokens: 1200,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.evolveSolutionsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.5,
    maxOutputTokens: 1200,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.createProsConsModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 2048,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.evolutionMutateModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 1024,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.evolutionRecombineModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.7,
    maxOutputTokens: 1024,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.validationModel = {
    name: "gpt-4-1106-preview",
    temperature: 0.0,
    maxOutputTokens: 1024,
    tokenLimit: gpt4TotalTokenLimit,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    limitTPM: gpt4_TPM,
    limitRPM: gpt4_RPM,
    verbose: false,
};
PsConstants.getPageCacheExpiration = 60 * 60 * 24 * 7 * 4 * 6; // 6 months
PsConstants.maxSubProblems = 7;
PsConstants.maxNumberGeneratedOfEntities = 7;
PsConstants.maxStabilityRetryCount = 14;
PsConstants.mainLLMmaxRetryCount = 40;
PsConstants.limitedLLMmaxRetryCount = 10;
PsConstants.rankingLLMmaxRetryCount = 40;
// See also hardcoded 3 for project 1 in createSolutions
PsConstants.maxTopEntitiesToSearch = 4;
PsConstants.maxTopEntitiesToRender = 3;
PsConstants.maxTopQueriesToSearchPerType = 5;
PsConstants.maxTopEvidenceQueriesToSearchPerType = 4;
PsConstants.maxTopRootCauseQueriesToSearchPerType = 5;
PsConstants.maxRootCausePercentOfSearchResultWebPagesToGet = 0.65;
PsConstants.maxRootCausesToUseForRatingRootCauses = 5;
PsConstants.topWebPagesToGetForRefineRootCausesScan = 10;
PsConstants.mainSearchRetryCount = 40;
PsConstants.maxDalleRetryCount = 7;
PsConstants.maxTopWebPagesToGet = 5;
PsConstants.maxBingSearchResults = 10;
PsConstants.maxTopProsConsUsedForRating = 2;
PsConstants.maxNumberGeneratedProsConsForSolution = 3;
PsConstants.minSleepBeforeBrowserRequest = 50;
PsConstants.maxAdditionalRandomSleepBeforeBrowserRequest = 100;
PsConstants.numberOfSearchTypes = 4;
PsConstants.webPageNavTimeout = 30 * 1000;
PsConstants.subProblemsRankingMinNumberOfMatches = 10;
PsConstants.currentUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
PsConstants.topItemsToKeepForTopicClusterPruning = 3;
PsConstants.chances = {
    createSolutions: {
        searchQueries: {
            useMainProblemSearchQueries: 0.01,
            useOtherSubProblemSearchQueries: 0.01,
            useSubProblemSearchQueries: 0.38,
            useRandomEntitySearchQueries: 0.58,
        },
        webSolutions: {
            top: 0.05,
            topThree: 0.25,
            topSeven: 0.50,
            all: 0.20,
        },
        notUsingTopSearchQueries: 0.1,
        vectorSearchAcrossAllProblems: 0.001,
    },
};
PsConstants.maxTopSearchQueriesForSolutionCreation = 8;
PsConstants.maxPercentOfSolutionsWebPagesToGet = 0.25;
PsConstants.limits = {
    webPageVectorResultsForNewSolutions: 14,
    useRandomTopFromVectorSearchResults: 14,
};
PsConstants.enable = {
    refine: {
        createSubProblems: true,
        createEntities: true,
        createSolutions: true,
        createProsCons: true,
        policiesSeed: true,
    },
};
PsConstants.evolution = {
    populationSize: 80,
    limitTopTopicClusterElitesToEloRating: 850,
    // Population split
    keepElitePercent: 0.1,
    randomImmigrationPercent: 0.4,
    mutationOffspringPercent: 0.35,
    crossoverPercent: 0.15,
    // General mutation rate split
    lowMutationRate: 0.5,
    mediumMutationRate: 0.3,
    highMutationRate: 0.2,
    selectParentTournamentSize: 7,
    crossoverMutationPercent: 0.05,
};
PsConstants.maxPercentOfEloMatched = 0.75;
PsConstants.minimumNumberOfPairwiseVotesForPopulation = 10;
PsConstants.maxNumberOfPairwiseRankingPrompts = PsConstants.evolution.populationSize * PsConstants.minimumNumberOfPairwiseVotesForPopulation;
PsConstants.maxTopSolutionsToCreatePolicies = 3;
PsConstants.maxTopPoliciesToProcess = 1;
PsConstants.maxEvidenceToUseForRatingEvidence = 5;
PsConstants.policyEvidenceFieldTypes = [
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
];
PsConstants.rootCauseFieldTypes = [
    "allPossibleHistoricalRootCausesIdentifiedInTextContext",
    "allPossibleEconomicRootCausesIdentifiedInTextContext",
    "allPossibleScientificRootCausesIdentifiedInTextContext",
    "allPossibleCulturalRootCausesIdentifiedInTextContext",
    "allPossibleSocialRootCausesIdentifiedInTextContext",
    "allPossibleEnvironmentalRootCausesIdentifiedInTextContext",
    "allPossibleLegalRootCausesIdentifiedInTextContext",
    "allPossibleTechnologicalRootCausesIdentifiedInTextContext",
    "allPossibleGeopoliticalRootCausesIdentifiedInTextContext",
    "allPossibleEthicalRootCausesIdentifiedInTextContext",
    "allPossibleRootCausesCaseStudiesIdentifiedInTextContext",
];
//# sourceMappingURL=constants.js.map