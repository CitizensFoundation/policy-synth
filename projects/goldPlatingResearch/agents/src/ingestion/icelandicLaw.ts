import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";

export class IcelandicLawXmlAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;

  skipAiModels = true;

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    console.log(`IcelandicLawXmlAgent constructor`);
  }

  async processItem(item: GoldplatingResearchItem): Promise<void> {
    await this.updateRangedProgress(0, "Starting article extraction from XML");

    try {
      const url = item.nationalLaw.law.url;
      console.log(`Processing XML from URL: ${url}`);
      const articles = await this.processLawXml(url);
      console.log(`Extracted ${articles.length} articles`);

      // Store the extracted articles in the research item
      item.nationalLaw.law.articles = articles;

      await this.updateRangedProgress(100, "Article extraction from XML completed");
      await this.saveMemory();
    } catch (error) {
      console.error(`Error during article extraction from XML: ${error}`);
      throw error;
    }
  }

  async processLawXml(url: string): Promise<LawArticle[]> {
    const xmlContent = await this.fetchXmlContent(url);
    console.log(`Fetched XML content, length: ${xmlContent.length}`);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const jsonObj = parser.parse(xmlContent);
    console.log(`Parsed XML to JSON: ${JSON.stringify(jsonObj).slice(0, 200)}...`);

    if (!jsonObj.law) {
      console.error('No "law" object found in parsed XML');
      return [];
    }

    const articles: LawArticle[] = [];
    this.extractArticles(jsonObj.law, articles);
    console.log(`Extracted ${articles.length} articles`);

    return articles;
  }

  private async fetchXmlContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  }

  private extractArticles(node: any, articles: LawArticle[]) {
    console.log(`Extracting articles from node: ${JSON.stringify(node).slice(0, 200)}...`);

    if (node.chapter && Array.isArray(node.chapter)) {
      for (const chapter of node.chapter) {
        this.extractArticles(chapter, articles);
      }
    } else if (node.chapter) {
      this.extractArticles(node.chapter, articles);
    }

    if (node.art && Array.isArray(node.art)) {
      for (const article of node.art) {
        this.extractArticleContent(article, articles);
      }
    } else if (node.art) {
      this.extractArticleContent(node.art, articles);
    }
  }

  private extractArticleContent(article: any, articles: LawArticle[]) {
    console.log(`Extracting content from article: ${JSON.stringify(article).slice(0, 200)}...`);

    const articleNumber = parseInt(article['@_nr'], 10);
    let articleText = "";

    if (article.subart && Array.isArray(article.subart)) {
      for (const subart of article.subart) {
        articleText += this.extractSentences(subart);
      }
    } else if (article.subart) {
      articleText += this.extractSentences(article.subart);
    }

    if (!isNaN(articleNumber) && articleText.trim() !== "") {
      articles.push({
        number: articleNumber,
        text: articleText.trim(),
        description: "" // This field is included to match the LawArticle interface
      });
      console.log(`Added article ${articleNumber}`);
    } else {
      console.log(`Failed to add article: number=${articleNumber}, text length=${articleText.length}`);
    }
  }

  private extractSentences(subart: any): string {
    let text = "";
    if (subart.sen && Array.isArray(subart.sen)) {
      for (const sentence of subart.sen) {
        if (typeof sentence === 'string') {
          text += sentence + " ";
        }
      }
    } else if (subart.sen && typeof subart.sen === 'string') {
      text += subart.sen + " ";
    }
    return text;
  }

  private isValidExtractionResult(result: any): result is LawArticle {
    return (
      typeof result === "object" &&
      typeof result.number === "number" &&
      typeof result.text === "string" &&
      result.text.trim().length > 0
    );
  }

  static async runFromCommandLine(url: string): Promise<void> {
    const minimalAgent = {
      id: 0,
      // Add other required properties of PsAgent as needed
    } as PsAgent;

    const minimalMemory = {} as GoldPlatingMemoryData;

    const agent = new IcelandicLawXmlAgent(minimalAgent, minimalMemory, 0, 100);

    try {
      console.log(`Processing XML from URL: ${url}`);
      const articles = await agent.processLawXml(url);
      console.log(`Extracted ${articles.length} articles:`);
      console.log(JSON.stringify(articles, null, 2));
    } catch (error) {
      console.error("Error processing XML:", error);
    }
  }
}

// Command-line execution
if (typeof process !== 'undefined' && process.argv.length > 1) {
  const scriptPath = process.argv[1];
  if (scriptPath.includes('icelandicLaw') || scriptPath.includes('IcelandicLawXmlAgent')) {
    const url = process.argv[2];
    if (!url) {
      console.error("Please provide a URL as a command-line argument.");
      process.exit(1);
    }
    console.log(`Processing XML from URL: ${url}`);
    IcelandicLawXmlAgent.runFromCommandLine(url);
  } else {
    console.log(`IcelandicLawXmlAgent loaded`);
  }
} else {
  console.log(`IcelandicLawXmlAgent loaded in a non-Node.js environment`);
}