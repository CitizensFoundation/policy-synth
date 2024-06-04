declare module "pdfjs-dist/build/pdf.js";
declare module "pdfreader";
declare module "ml-pca";

declare module "puppeteer-extra" {
  import puppeteer from "puppeteer";
  const puppeteerExtra: typeof puppeteer & {
    use: (plugin: any) => void;
    launch: typeof puppeteer.launch;
  };
  export = puppeteerExtra;
}

type HeaderImage = {
  image: string;
  source: string;
};

type Link = {
  text: string;
  link: string;
};

type SiteLink = {
  title: string;
  link: string;
};

type DetectedExtensions = {
  [key: string]: number;
};

type RichSnippet = {
  bottom: {
    extensions: string[];
    detected_extensions: DetectedExtensions;
  };
};

type Source = {
  description: string;
  source_info_link: string;
  security: string;
  icon: string;
};

type AboutThisResult = {
  source: Source;
  keywords: string[];
  languages: string[];
  regions: string[];
};

interface IEnginePairWiseVoteResults {
  wonItemIndex: number | undefined;
  lostItemIndex: number | undefined;
}

interface IEngineWorkerData {
  groupId: number;
  communityId: number;
  domainId: number;
  initialProblemStatement: string;
}

interface IEngineProblemStatement extends PsEloRateable{
  description: string;
  searchQueries: IEngineSearchQueries;
  searchResults: IEngineSearchResults;
  solutionsFromSearch?: IEngineSolution[];
  rootCauseSearchQueries?: PSRootCauseSearchQueries;
  rootCauseSearchResults?: PSRootCauseSearchResults;
  haveScannedWeb?: boolean;
  imagePrompt?: string;
  imageUrl?: string;
}

interface IEngineSubProblem extends PsEloRateable {
  title: string;
  description: string;
  displayDescription?: string;
  imageUrl?: string;
  imagePrompt?: string;
  whyIsSubProblemImportant: string;
  shortDescriptionForPairwiseRanking?: string;
  yearPublished?: number;
  relevanceToTypeScore?: number;
  relevanceScore?: number;
  qualityScore?: number;
  confidenceScore?: number;
  fromSearchType?: PSRootCauseWebPageTypes;
  fromUrl?: string;
  entities: IEngineAffectedEntity[];
  searchQueries: IEngineSearchQueries;
  searchResults: IEngineSearchResults;
  solutionsFromSearch?: IEngineSolution[];
  customSearchUrls?: string[];
  haveScannedWeb?: boolean;
  solutions: {
    populations: IEngineSolution[][];
  };
  policies?: {
    populations: PSPolicy[][];
  };
  processingActive?: boolean;
}

interface IEngineAffectedEntityBase {
  name: string;
}

interface IEngineAffectedEntityAffect {
  reason: string;
}

interface IEngineAffectedEntity extends PsEloRateable {
  name: string;
  positiveEffects?: IEngineAffectedEntityAffect[];
  negativeEffects?: IEngineAffectedEntityAffect[];
  searchQueries?: IEngineSearchQueries;
  searchResults?: IEngineSearchResults;
  solutionsFromSearch?: IEngineSolution[];
  haveScannedWeb?: boolean;
}

interface IEngineSolutionAffectedEntity extends IEngineAffectedEntityBase {
  positiveEffects?: string[];
  negativeEffects?: string[];
  positiveScore: number;
  negativeScore: number;
}

interface IEngineSimilarityGroup {
  index: number;
  isFirst?: boolean;
  totalCount?: number;
}

interface PsEloRateable {
  eloRating?: number;
}

interface IEngineSolution extends PsEloRateable {
  id: string;
  title: string;
  description: string;
  similarityGroup?: IEngineSimilarityGroup;
  isFirstInGroup?: boolean;
  mainBenefitOfSolutionComponent: string;
  mainObstacleToSolutionComponentAdoption: string;
  mainBenefitOfSolution?: string;
  mainObstacleToSolutionAdoption?: string;
  relevanceToProblem?: string;
  fromSearchType?: IEngineWebPageTypes;
  fromUrl?: string;
  contacts?: string[];
  affectedEntities?: IEngineSolutionAffectedEntity[];
  pros?: string[] | IEngineProCon[];
  cons?: string[] | IEngineProCon[];
  imageUrl?: string;
  imagePrompt?: string;
  reaped?: boolean;
  ratings?: object;
  family?: {
    parentA?: string; // "<generationIndex>:<solutionId>"
    parentB?: string;
    mutationRate?: IEngineMutationRates;
    seedUrls?: string[];
    gen?: number;
  };
}

interface IEngineProCon extends PsEloRateable {
  id?: number;
  description: string;
}

interface IEEngineSearchResultPage {
  url: string;
  title: string;
  description: string;
  data?: string;
}

interface IEEngineSearchResultData {
  searchQuery: string;
  pages: IEEngineSearchResultPage[];
}

type PsMemoryStageTypes =
  | "create-root-causes-search-queries"
  | "rank-root-causes-search-queries"
  | "web-search-root-causes"
  | "rank-root-causes-search-results"
  | "web-get-root-causes-pages"
  | "rank-web-root-causes"
  | "rate-web-root-causes"
  | "web-get-refined-root-causes"
  | "get-metadata-for-top-root-causes"
  | "create-sub-problems"
  | "reduce-sub-problems"
  | "create-entities"
  | "create-search-queries"
  | "create-pros-cons"
  | "create-solution-images"
  | "create-sub-problem-images"
  | "create-problem-statement-image"
  | "rank-search-results"
  | "rank-search-queries"
  | "rank-sub-problems"
  | "rank-entities"
  | "rank-web-solutions"
  | "dedup-web-solutions"
  | "rank-solutions"
  | "rank-pros-cons"
  | "rate-solutions"
  | "group-solutions"
  | "topic-map-solutions"
  | "evolve-create-population"
  | "evolve-mutate-population"
  | "evolve-recombine-population"
  | "evolve-reap-population"
  | "evolve-rank-population"
  | "web-search"
  | "web-get-pages"
  | "create-seed-solutions"
  | "analyse-external-solutions"
  | "policies-create-images"
  | "policies-seed"
  | "create-evidence-search-queries"
  | "web-search-evidence"
  | "web-get-evidence-pages"
  | "rank-web-evidence"
  | "rate-web-evidence"
  | "web-get-refined-evidence"
  | "get-metadata-for-top-evidence"
  | "ingestion-agent"
  | "validation-agent"
  | "engineering-agent"
  ;

interface IEngineUserFeedback {
  feedbackType: string;
  subjectText: string;
  userFeedback?: string;
  userFeedbackRatings?: number[];
}

interface IEngineBaseAIModelConstants {
  name: string;
  temperature: number;
  maxOutputTokens: number;
  tokenLimit: number;
  inTokenCostUSD: number;
  outTokenCostUSD: number;
  limitTPM: number;
  limitRPM: number;
  verbose: boolean;
}

interface IEngineMemoryData {
  redisKey: string;
  timeStart: number;
  totalCost: number;
  groupId: number;
  communityId: number;
  domainId: number;
  lastSavedAt?: number;
  currentStageError?: string | undefined;
}

interface IEngineInnovationStagesData {
  timeStart?: number;
  userFeedback?: IEngineUserFeedback[];
  tokensIn?: number;
  tokensOut?: number;
  tokensInCost?: number;
  tokensOutCost?: number;
}

interface IEngineSearchQueries {
  general: string[];
  scientific: string[];
  news: string[];
  openData: string[];
}

interface IEngineSearchQuery {
  general: string;
  scientific: string;
  news: string;
  openData: string;
}

interface IEngineSearchResultItem extends PsEloRateable {
  title: string;
  originalPosition: number;
  description: string;
  url: string;
  date: string;
  //TODO: Depricated
  link?: string;
  //TODO: Depricated
  position?: number;
}

interface IEngineSearchResults {
  pages: {
    general: IEngineSearchResultItem[];
    scientific: IEngineSearchResultItem[];
    news: IEngineSearchResultItem[];
    openData: IEngineSearchResultItem[];
  };
}

interface PsBaseMemoryData extends IEngineMemoryData {
  currentStage: PsMemoryStageTypes;
  stages: Record<PsMemoryStageTypes, IEngineInnovationStagesData>;
  problemStatement: IEngineProblemStatement;
  customInstructions: {
    createRootCause?: string;
    createSubProblems?: string;
    rankSubProblems?: string;
    createSolutions?: string;
    rankSolutions?: string;
    reapSolutions?: string;
    rateSolutionsJsonFormat?: string;
    subProblemColors?: string[];
    secondaryColors?: string[];
    rootCauseUrlsToScan?: string[];
  };
  subProblems: IEngineSubProblem[];
  allSubProblems?: IEngineSubProblem[];
  subProblemClientColors?: string[];
  currentStageData?:
    | IEEngineSearchResultData
    | IEEngineSearchResultPage
    | undefined;
}

type IEngineWebPageTypes = "general" | "scientific" | "openData" | "news";
type IEngineWebPageTargets = "problemStatement" | "subProblem" | "entity";

interface IEngineWebPageAnalysisData {
  mostRelevantParagraphs: string[];
  solutionsIdentifiedInTextContext: string[];
  relevanceToProblem: string;
  tags?: string[];
  entities?: string[];
  contacts?: string[];
  summary: string;
  url: string;
  searchType: IEngineWebPageTypes;
  subProblemIndex?: number;
  entityIndex?: number;
  groupId: number;
  communityId: number;
  domainId: number;
  _additional?: {
    distance: number;
    id?: string;
  };
}

interface IEngineWebPageGraphQlResults {
  data: {
    Get: {
      WebPage: IEngineWebPageAnalysisData[];
    };
  };
}

interface IEngineSolutionForReapInputData {
  title: string;
  description: string;
}

interface IEngineSolutionForReapReturnData {
  title: string;
}

interface IEngineSolutionForGroupCheck extends IEngineSolutionForReapCheck {
  index: number;
}

interface IEngineWebPageGraphQlSingleResult {
  class?: string | undefined;
  vectorWeights?: {
      [key: string]: unknown;
  } | undefined;
  properties?: object | undefined;
  id?: string | undefined;
  creationTimeUnix?: number | undefined;
  lastUpdateTimeUnix?: number | undefined;
  vector?: number[] | undefined;
  additional?: {
    id?: string | undefined;
  };
}

interface IEngineRateLimits {
  [modelName: string]: {
    requests: Array<{ timestamp: number }>;
    tokens: Array<{ count: number; timestamp: number }>;
  };
}

interface IEngineExternalSolutionAnalysis {
  externalSolutionIndex: number;
  externalSolution: string;
  subProblemIndex: number;
  populationIndex: number;
  topSolutionMatches: {
    index: number;
    title: string;
    description: string;
    percent: number;
  }[];
}

interface IEngineExternalSolutionAnalysisResults {
  solutionCoversPercentOfKeyRequirements: number;
}

interface IEngineReapingResults {
  solutionFitsRequirements: boolean;
}

type IEngineMutationRates = "low" | "medium" | "high";

interface PSModelConfig {
  apiKey: string;
  modelName?: string;
  maxTokensOut?: number;
};

interface PSAzureModelConfig extends PSModelConfig {
  endpoint: string;
  deploymentName: string;
};

interface PSOpenAiModelConfig extends PSModelConfig {
  projectId?: string;
};


