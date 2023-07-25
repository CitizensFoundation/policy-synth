const gpt4InTokenPrice = 0.03 / 1000;
const gpt4OutTokenPrice = 0.06 / 1000;

const gpt35_16kInTokenPrice = 0.003 / 1000;
const gpt35_16kOutTokenPrice = 0.004 / 1000;

const gpt35InTokenPrice = 0.0015 / 1000;
const gpt35kOutTokenPrice = 0.002 / 1000;

export class IEngineConstants {
  static createSubProblemsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.9,
    maxOutputTokens: 2048,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: true,
  };

  static createEntitiesModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.9,
    maxOutputTokens: 2048,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: true,
  };

  static createSearchQueriesModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.9,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: true,
  };

  static searchQueryRankingsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: true,
  };

  static searchResultsRankingsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: false,
  };

  static subProblemsRankingsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: true,
  };

  static entitiesRankingsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: true,
  };

  static solutionsRankingsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: false,
  };

  static prosConsRankingsModel: IEngineBaseAIModelConstants = {
    name: "gpt-3.5-turbo",
    temperature: 0.0,
    maxOutputTokens: 2,
    tokenLimit: 8192,
    inTokenCostUSD: gpt35InTokenPrice,
    outTokenCostUSD: gpt35kOutTokenPrice,
    verbose: false,
  };

  static getPageAnalysisModel: IEngineBaseAIModelConstants = {
    name: "gpt-3.5-turbo-16k",
    temperature: 0.0,
    maxOutputTokens: 2048,
    tokenLimit: 16385,
    inTokenCostUSD: gpt35_16kInTokenPrice,
    outTokenCostUSD: gpt35_16kOutTokenPrice,
    verbose: false,
  };

  static createSolutionsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.9,
    maxOutputTokens: 1200,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: false,
  };

  static evolveSolutionsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.9,
    maxOutputTokens: 1200,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: false,
  };

  static createProsConsModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 0.9,
    maxOutputTokens: 2048,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: false,
  };

  static evolutionMutateModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 1.0,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: false,
  };

  static evolutionRecombineModel: IEngineBaseAIModelConstants = {
    name: "gpt-4",
    temperature: 1.0,
    maxOutputTokens: 1024,
    tokenLimit: 8192,
    inTokenCostUSD: gpt4InTokenPrice,
    outTokenCostUSD: gpt4OutTokenPrice,
    verbose: false,
  };

  static getPageTimeout = 1000 * 10;

  static getPageCacheExpiration = 60 * 60 * 24 * 7 * 4 * 6; // 6 months

  static maxSubProblems = 7;

  static maxNumberGeneratedOfEntities = 7;

  static mainLLMmaxRetryCount = 40;

  static rankingLLMmaxRetryCount = 40;

  static maxTopEntitiesToSearch = 3;

  static maxTopEntitiesToRender = 3;

  static maxTopQueriesToSearchPerType = 2;

  static mainSearchRetryCount = 40;

  static maxTopWebPagesToGet = 5;

  static maxWebPagesToGetByTopSearchPosition = 5;

  static maxSearchResults = 10;

  static maxTopProsConsUsedForRanking = 1;

  static maxNumberGeneratedProsConsForSolution = 9;

  static minSleepBeforeBrowserRequest = 1100;

  static maxAdditionalRandomSleepBeforeBrowserRequest = 1100;

  static numberOfSearchTypes = 4;

  static chances = {
    createSolutions: {
      searchQueries: {
        useMainProblemSearchQueries: 0.05,
        useOtherSubProblemSearchQueries: 0.05,
        useSubProblemSearchQueries: 0.5,
        useRandomEntitySearchQueries: 0.4,
      },
      notUsingFirstSearchQuery: 0.8,
      vectorSearchAcrossAllProblems: 0.2,
    },
  };

  static maxTopSearchQueriesForSolutionCreation = 4;

  static limits = {
    webPageVectorResultsForNewSolutions: 10,
    useRandomTopFromVectorSearchResults: 7,
  };

  static enable = {
    refine: {
      createSubProblems: true,
      createEntities: true,
      createSolutions: true,
      createProsCons: true,
    },
  };

  static evolution = {
    populationSize: 60,

    // Population split
    keepElitePercent: 0.1,
    randomImmigrationPercent: 0.3,
    mutationOffspringPercent: 0.3,
    crossoverPercent: 0.3,

    // General mutation rate split
    lowMutationRate: 0.4,
    mediumMutationRate: 0.5,
    highMutationRate: 0.1,

    selectParentTournamentSize: 4,
    crossoverMutationPercent: 0.2
 };

  static currentUserAgent =
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
}

