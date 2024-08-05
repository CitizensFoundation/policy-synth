// Here is my data structure

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

interface GoldPlatingResearch {
  results: ResearchResults;
  possibleGoldplating?: boolean;
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

interface EuLaw {
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
  nationalLaw: NationalLaw;
  supportArticleTextArticleIdMapping: Record<number, number>;
  nationalRegulation: NationalRegulation;
  euLaw: EuLaw;
  euRegulation: EuRegulation;
}

interface GoldPlatingMemoryData extends PsAgentMemoryData {
  researchItems: GoldplatingResearchItem[];
  scannedPages?: { [url: string]: string };
}

// Here is our overall Agent Process
// 1. Go through each researchItems
// 2. Download the laws and reguluations (for national and EU) using a webscanning agent
// 3. For all National laws and regulations (not for Eu laws and regulations, we always just use the fullText from those):
// 3.1 Cleanup the text with a text for all content with a text cleaning agent
// 3.1.1. This agent should have three agents that exectute in parallel to check the output of the text cleaning agent if it has hallucinations, correctness and completness
// 3.2. Extract the articles from the text with a text extraction agent, verify the articles with again three parallel agents for  hallucinations, correctness and completness
// 3.2.1. Save the articles into the GoldPlatingMemoryData in the right sub objects
// 3.3. Extract the support text from the articles with a text extraction agent, verify the support text with again three parallel agents for  hallucinations, correctness and completness
// 4. Loop through each law article, one at the time, and compare it to the whole EU law to search for goldplating and save into the correct GoldPlatingResearch under the right article
// 5. Loop through each regulation article, one at the time, and compare it the whole EU law to search for goldplating and save into the correct GoldPlatingResearch under the right article
// 6. Loop through each law article, one at the time, and compare it to the whole EU regulation to search for goldplating and save into the correct GoldPlatingResearch under the right article
// 7. Loop through each regulation article, one at the time, and compare it to the whole EU regulation to search for goldplating and save into the correct GoldPlatingResearch under the right article
// 8. Now loop through laws and regulations again and for each GoldPlatingResearch that has a possibleGoldplating lookup the supportText for the article to look for explainations
// 9. Now pairwise rank all the GoldPlatingResearch found and give the articles a elo rating

// Use supportArticleTextArticleIdMapping as the supportingArticleText comes from the original law proposal so the numbers might not match up to the fully release law
// Always save the memory after each step

// Agents to build:
// Top Level Agent Class
// Sub Agents:
// - WebScanningAgent (to read in all the URLs into the memory object, see example agent provided in your context)
// - TextCleaningAgent (to split the National laws, regulations and descritop)
// -- With build in sub agents (callLlm and prompts for) Hallucination, correctness and completness Agent (the example provided is with an older version of the @policysynth/agents SDK so needs to be brought in line with all the other examples)
// - ArticleExtractionAgent
// -- With build in sub agents (callLlm and prompts for) Hallucination, correctness and completness Agent (the example provided is with an older version of the @policysynth/agents SDK so needs to be brought in line with all the other examples)
// - GoldPlatingSearchAgent
// - SupportTextReviewAgent
// - FoundGoldPlating pairwise ranking agent

// I provide you the context the base classes used and types
// I also provide marketing research example agent classes as you should use as your main reference
// I also provide old example of a text cleaning agent with sub agents, this is in and old format you should update based on the other refrences

// We shall build one agent at the type, please start with the Top Level Agent Class for GoldPlating Research Agent

