declare module 'pdfjs-dist/build/pdf.js'
declare module 'pdfreader'

declare module 'puppeteer-extra' {
  import puppeteer from 'puppeteer';
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

type SerpOrganicResult = {
  position: number;
  title: string;
  link: string;
  date: string;
  eloRating?: number;
  displayed_link: string;
  snippet: string;
  sitelinks: {
      inline: SiteLink[];
  };
  rich_snippet: RichSnippet;
  about_this_result: AboutThisResult;
  about_page_link: string;
  about_page_serpapi_link: string;
  cached_page_link: string;
  related_pages_link: string;
};

type SerpOrganicResults = SerpOrganicResult[];

interface IEnginePairWiseVoteResults {
  wonItemIndex: number | undefined;
  lostItemIndex: number | undefined
}

interface IEngineWorkerData {
  groupId: number;
  communityId: number;
  domainId: number;
  initialProblemStatement: string;
}

interface IEngineProblemStatement {
  description: string;
  searchQueries: IEngineSearchQueries;
  searchResults: IEngineSearchResults;
}

interface IEngineSubProblem {
  title: string;
  description: string;
  whyIsSubProblemImportant: string;
  entities: IEngineAffectedEntity[];
  searchQueries: IEngineSearchQueries;
  searchResults: IEngineSearchResults;
  eloRating?: number;
  solutions: {
    populations: IEngineSolution[][];
  }
}

interface IEngineAffectedEntityBase {
  name: string;
}

interface IEngineAffectedEntityAffect {
  reason: string;
}

interface IEngineAffectedEntity {
  name: string;
  positiveEffects?: IEngineAffectedEntityAffect[];
  negativeEffects?: IEngineAffectedEntityAffect[];
  eloRating?: number;
  searchQueries?: IEngineSearchQueries;
  searchResults?: IEngineSearchResults;
}

interface IEngineSolutionAffectedEntity extends IEngineAffectedEntityBase {
  positiveEffects?: string[];
  negativeEffects?: string[];
  positiveScore: number;
  negativeScore: number;
}

interface IEngineSolution {
  id: string;
  title: string;
  description: string;
  eloRating?: number;
  mainBenefitOfSolution: string;
  mainObstacleToSolutionAdoption: string;
  affectedEntities?: IEngineSolutionAffectedEntity[];
  pros?: string[] | IEngineProCon[];
  cons?: string[] | IEngineProCon[];
}

interface IEngineProCon {
  id?: number;
  description: string;
  eloRating?: number;
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

type IEngineStageTypes =
  | "create-sub-problems"
  | "create-entities"
  | "create-search-queries"
  | "create-pros-cons"
  | "rank-search-results"
  | "rank-search-queries"
  | "rank-sub-problems"
  | "rank-entities"
  | "rank-solutions"
  | "rank-pros-cons"
  | "evolve-create-population"
  | "evolve-mutate-population"
  | "evolve-recombine-population"
  | "evolve-rank-population"
  | "web-search"
  | "web-get-pages"
  | "create-seed-solutions"
  | "parse"
  | "save"
  | "done";

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

interface IEngineSearchResultItem {
  title: string;
  originalPosition: number;
  description: string;
  url: string;
  date: string;
  eloRating?: number;
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

interface IEngineInnovationMemoryData extends IEngineMemoryData {
  currentStage: IEngineStageTypes;
  stages: Record<IEngineStageTypes, IEngineInnovationStagesData>;
  problemStatement: IEngineProblemStatement;
  systemInstructions: {
    createSubProblems?: string;
    rankSubProblems?: string;
    createSolutions?: string;
    rankSolutions?: string;
  }
  subProblems: IEngineSubProblem[];
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
  tags: string[];
  entities: string[];
  summary: string;
  url: string;
  searchType: IEngineWebPageTypes;
  subProblemIndex?: number;
  groupId: number;
  communityId: number;
  domainId: number;
  _additional: {
    distance: number;
  };
}

interface IEngineWebPageGraphQlResults {
  data: {
    Get: {
      WebPage: IEngineWebPageAnalysisData[];
    }
  }
}

type IEngineMutationRates = "low" | "medium" | "high";