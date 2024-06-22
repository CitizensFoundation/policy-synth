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

interface PsPairWiseVoteResults {
  wonItemIndex: number | undefined;
  lostItemIndex: number | undefined;
}

interface PsWorkerData {
  groupId: number;
  communityId: number;
  domainId: number;
  initialProblemStatement: string;
}

interface PsScStagesData {
  timeStart?: number;
  userFeedback?: PsUserFeedback[];
  tokensIn?: number;
  tokensOut?: number;
  tokensInCost?: number;
  tokensOutCost?: number;
}

interface PsProblemStatement extends PsEloRateable{
  description: string;
  searchQueries: PsSearchQueries;
  searchResults: PsSearchResults;
  solutionsFromSearch?: PsSolution[];
  rootCauseSearchQueries?: PSRootCauseSearchQueries;
  rootCauseSearchResults?: PSRootCauseSearchResults;
  haveScannedWeb?: boolean;
  imagePrompt?: string;
  imageUrl?: string;
}

interface PsSubProblem extends PsEloRateable {
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
  entities: PsAffectedEntity[];
  searchQueries: PsSearchQueries;
  searchResults: PsSearchResults;
  solutionsFromSearch?: PsSolution[];
  customSearchUrls?: string[];
  haveScannedWeb?: boolean;
  solutions: {
    populations: PsSolution[][];
  };
  policies?: {
    populations: PSPolicy[][];
  };
  processingActive?: boolean;
}

interface PsAffectedEntityBase {
  name: string;
}

interface PsAffectedEntityAffect {
  reason: string;
}

interface PsAffectedEntity extends PsEloRateable {
  name: string;
  positiveEffects?: PsAffectedEntityAffect[];
  negativeEffects?: PsAffectedEntityAffect[];
  searchQueries?: PsSearchQueries;
  searchResults?: PsSearchResults;
  solutionsFromSearch?: PsSolution[];
  haveScannedWeb?: boolean;
}

interface PsSolutionAffectedEntity extends PsAffectedEntityBase {
  positiveEffects?: string[];
  negativeEffects?: string[];
  positiveScore: number;
  negativeScore: number;
}

interface PsSimilarityGroup {
  index: number;
  isFirst?: boolean;
  totalCount?: number;
}

interface PsEloRateable {
  eloRating?: number;
}

interface PsSolution extends PsEloRateable {
  id: string;
  title: string;
  description: string;
  similarityGroup?: PsSimilarityGroup;
  isFirstInGroup?: boolean;
  mainBenefitOfSolutionComponent: string;
  mainObstacleToSolutionComponentAdoption: string;
  mainBenefitOfSolution?: string;
  mainObstacleToSolutionAdoption?: string;
  relevanceToProblem?: string;
  fromSearchType?: PsWebPageTypes;
  fromUrl?: string;
  contacts?: string[];
  affectedEntities?: PsSolutionAffectedEntity[];
  pros?: string[] | PsProCon[];
  cons?: string[] | PsProCon[];
  imageUrl?: string;
  imagePrompt?: string;
  reaped?: boolean;
  ratings?: object;
  family?: {
    parentA?: string; // "<generationIndex>:<solutionId>"
    parentB?: string;
    mutationRate?: PsMutationRates;
    seedUrls?: string[];
    gen?: number;
  };
}

interface PsProCon extends PsEloRateable {
  id?: number;
  description: string;
}

interface PsSearchResultPage {
  url: string;
  title: string;
  description: string;
  data?: string;
}

interface PsSearchResultData {
  searchQuery: string;
  pages: PsSearchResultPage[];
}

type PsScMemoryStageTypes =
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

interface PsUserFeedback {
  feedbackType: string;
  subjectText: string;
  userFeedback?: string;
  userFeedbackRatings?: number[];
}

interface PsBaseAIModelConstants {
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

interface PsSearchQueries {
  general: string[];
  scientific: string[];
  news: string[];
  openData: string[];
}

interface PsSearchQuery {
  general: string;
  scientific: string;
  news: string;
  openData: string;
}

interface PsSearchResultItem extends PsEloRateable {
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

interface PsSearchResults {
  pages: {
    general: PsSearchResultItem[];
    scientific: PsSearchResultItem[];
    news: PsSearchResultItem[];
    openData: PsSearchResultItem[];
  };
}

interface PsSmarterCrowdsourcingMemoryData extends PsAgentBaseMemoryData {
  redisKey: string;
  groupId: number;
  communityId: number;
  domainId: number;
  lastSavedAt?: number;
  currentStage: PsScMemoryStageTypes;
  stages: Record<PsScMemoryStageTypes, PsScStagesData>;
  problemStatement: PsProblemStatement;
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
  subProblems: PsSubProblem[];
  allSubProblems?: PsSubProblem[];
  subProblemClientColors?: string[];
  currentStageError?: string | undefined;
  totalCost: number;
  currentStageData?:
    | PsSearchResultData
    | PsSearchResultPage
    | undefined;
}

type PsWebPageTypes = "general" | "scientific" | "openData" | "news";
type PsWebPageTargets = "problemStatement" | "subProblem" | "entity";

interface PsWebPageAnalysisData {
  mostRelevantParagraphs: string[];
  solutionsIdentifiedInTextContext: string[];
  relevanceToProblem: string;
  tags?: string[];
  entities?: string[];
  contacts?: string[];
  summary: string;
  url: string;
  searchType: PsWebPageTypes;
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

interface PsWebPageGraphQlResults {
  data: {
    Get: {
      WebPage: PsWebPageAnalysisData[];
    };
  };
}

interface PsSolutionForReapInputData {
  title: string;
  description: string;
}

interface PsSolutionForReapReturnData {
  title: string;
}

interface PsSolutionForGroupCheck extends PsSolutionForReapCheck {
  index: number;
}

interface PsWebPageGraphQlSingleResult {
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


interface PsExternalSolutionAnalysis {
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

interface PsExternalSolutionAnalysisResults {
  solutionCoversPercentOfKeyRequirements: number;
}

interface PsReapingResults {
  solutionFitsRequirements: boolean;
}

type PsMutationRates = "low" | "medium" | "high";

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


