interface BaseArticle {
  number: number | string;
  text: string;
  description: string;
  source?: string;
  eloRating?: number;
  research?: GoldPlatingResearch;
  researchNationalLanguageTranslation?: GoldPlatingResearch;
}

interface OneGoldplatingTypeResearch {
  goldPlatingType: string;
  goldPlatingIssueAnalysis: string;
  goldPlatingWasFound: boolean;
  goldPlatingForEuDirectiveArticlesNumbers: string[];
  goldPlatingPossibleReasons: string;
}

interface ResearchResults {
  detailedRules: string;
  expandedScope: string;
  exemptionsNotUtilized: string;
  stricterNationalLaws: string;
  disproportionatePenalties: string;
  earlierImplementation: string;
  conclusion: string;
  euDirectiveArticlesNumbers: string[];
  possibleReasons: string;
  goldPlatingWasFound: boolean;
}

interface LlmAnalysisResponse {
  analysis: ResearchResults;
  conclusion: string;
  reasonsForGoldPlating: string;
  euLawExtract?: string;
  conclusion?: string;
  englishTranslationOfIcelandicArticle?: string;
}

interface GoldPlatingResearch {
  url: string;
  results: ResearchResults;
  possibleGoldPlating?: boolean;
  likelyJustified?: boolean;
  justification?: string;
  description?: string;
  reasonForGoldPlating?: string;
  recommendation?: string;
  supportTextExplanation?: string;
  euLawExtract?: string;
  englishTranslationOfIcelandicArticle?: string;
}

interface LawArticle extends BaseArticle {
}

interface RegulationArticle extends BaseArticle {}

interface NationalLaw {
  law: {
    url: string;
    fullText: string;
    articles: LawArticle[];
  },
  supportArticleText: {
    url: string;
    fullText: string;
    articles: LawArticle[];
  }
}

interface EuDirective {
  url: string;
  fullText: string;
}

interface NationalRegulation {
  url: string;
  fullText: string;
  articles: LawArticle[];
}

interface EuRegulation {
  url: string;
  fullText: string;
}

interface GoldplatingResearchItem {
  name: string;
  nationalLaw: NationalLaw;
  supportArticleTextArticleIdMapping: Record<number, number>;
  lastLawArticleNumber?: number;
  nationalRegulation: NationalRegulation[];
  euDirective: EuDirective;
  euRegulation?: EuRegulation;
}

interface GoldPlatingMemoryData extends PsAgentMemoryData {
  researchItems: GoldplatingResearchItem[];
  scannedPages?: { [url: string]: string };
}
