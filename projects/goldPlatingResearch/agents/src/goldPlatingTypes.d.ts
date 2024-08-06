interface BaseArticle {
  number: string;
  text: string;
  description: string;
  eloRating?: number;
  research?: GoldPlatingResearch
}

interface ResearchResults {
  detailedRules: string;
  expandedScope: string;
  exemptionsNotUtilized: string;
  stricterNationalLaws: string;
  disproportionatePenalties: string;
  earlierImplementation: string;
  conclusion: string;
}

interface LlmAnalysisResponse {
  analysis: ResearchResults;
  conclusion: string;
  reasonsForGoldPlating: string;
}

interface GoldPlatingResearch {
  results: ResearchResults;
  possibleGoldPlating?: boolean;
  description?: string;
  reasonForGoldPlating?: string;
  recommendation?: string;
  supportTextExplanation?: string;
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
  nationalRegulation: NationalRegulation[];
  euDirective: EuDirective;
  euRegulation?: EuRegulation;
}

interface GoldPlatingMemoryData extends PsAgentMemoryData {
  researchItems: GoldplatingResearchItem[];
  scannedPages?: { [url: string]: string };
}
