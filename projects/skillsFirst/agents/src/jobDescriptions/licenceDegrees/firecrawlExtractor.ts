import FirecrawlApp, { CrawlStatusResponse, ScrapeResponse } from "@mendable/firecrawl-js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";

interface RelevanceCheckResult {
  isPossiblyRelevant: boolean;
  reasoning?: string;
}

/**
 * Convenience wrapper so callers get *both* the markdown content scraped
 * **and** the URL it originated from, instead of only the content.
 */
export interface ScrapedPage {
  /** URL where the content was scraped */
  url: string;
  /** Markdown representation of the page */
  content: string;
}

export class FirecrawlScrapeAndCrawlerAgent extends PolicySynthAgent {
  needsAiModel = false;
  private app: FirecrawlApp;

  licenseType: string;

  crawlPageLimit = 50;

  constructor(
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined,
    startProgress: number,
    endProgress: number,
    licenseType: string
  ) {
    super(agent, memory, startProgress, endProgress);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("Missing FIRECRAWL_API_KEY environment variable");
    }
    this.app = new FirecrawlApp({ apiKey });
    this.licenseType = licenseType;
  }

  private async checkIfRelevant(
    document: string
  ): Promise<RelevanceCheckResult> {
    const messages = [
      {
        role: "system" as const,
        message: `You are an AI assistant tasked with determining the possible relevance of web page content for extracting occupational licensing requirements in New Jersey.

Instructions:

1.  Analyze the provided <DocumentToAnalyze>.
2.  Determine if it contains information about licensing requirements specifically for **${this.licenseType}** in New Jersey.
3.  The focus is on identifying requirements related to college degrees (Associate's, Bachelor's, Graduate/Professional).
4.  If the document *only* contains generic information, legal disclaimers, privacy policies, or terms of service without specific licensing details for **${this.licenseType}**, consider it **not relevant**.
5.  If the document contains relevant information about degree requirements for **${this.licenseType}** in New Jersey, consider it **relevant**.

Output format: Return *only* a JSON object with the following structure:
  {
   "isPossiblyRelevant": boolean, // true if possibly relevant, false otherwise
   "reasoning": string // Brief explanation for your decision
  }
  `,
      },
      {
        role: "user" as const,
        message: `<DocumentToAnalyze>${document}</DocumentToAnalyze>

Your JSON output:`,
      },
    ];

    try {
      const result = (await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Medium,
        messages
      )) as RelevanceCheckResult;

      if (result.isPossiblyRelevant) {
        this.logger.debug("IS RELEVANT ---------------------------------");
        this.logger.debug(document);
        this.logger.debug("--------------------------------");
      } else {
        this.logger.debug("NOT RELEVANT");
      }

      return result;
    } catch (error: any) {
      this.logger.warn(
        "checkIfRelevant: Model did not return a valid JSON object. Falling back to false."
      );
      return { isPossiblyRelevant: false };
    }
  }

  /**
   * Scrape a URL using Firecrawl. If rate‑limited (429), it will retry
   * after the time specified by the Retry‑After header.
   *
   * @param url - The URL to scrape
   * @param formats - An array of formats to request, e.g. ['markdown', 'html']
   * @param maxRetries - Maximum number of retries upon rate limits
   * @param crawlUrlIfNotPdf - If true, will deep‑crawl non‑PDF URLs up to `crawlPageLimit`
   * @returns Array of objects, each containing the original URL and its markdown content
   */
  public async scrapeUrl(
    url: string,
    formats: (
      | "markdown"
      | "html"
      | "rawHtml"
      | "content"
      | "links"
      | "screenshot"
      | "screenshot@fullPage"
      | "extract"
    )[] = ["markdown", "rawHtml"],
    maxRetries: number = 3,
    crawlUrlIfNotPdf: boolean
  ): Promise<ScrapedPage[]> {
    let retries = 0;

    while (retries <= maxRetries) {
      try {
        this.logger.debug(`Attempting to scrape: ${url}, try #${retries + 1}`);

        // 1️⃣ CRAWL branch ──────────────────────────────────────────────
        if (crawlUrlIfNotPdf && !url.endsWith(".pdf")) {
          this.logger.debug(`Crawling ${url} because it is not a PDF`);
          const crawlResponse = await this.app.crawlUrl(url, {
            limit: this.crawlPageLimit,
            scrapeOptions: {
              formats,
              excludeTags: [
                "img",
                "svg",
                "a",
                "iframe",
                "script",
                "style",
                "br",
              ],
            },
          });

          this.logger.debug(
            `Crawl response length: ${Object.keys(crawlResponse).length}`
          );

          if (!crawlResponse.success) {
            throw new Error(`Failed to crawl: ${crawlResponse.error}`);
          }

          // 🔁 Build {url, content} array and relevance‑filter it
          let pages: ScrapedPage[] = crawlResponse.data
            ? crawlResponse.data.map((item: any) => ({
                url: item.metadata.sourceURL as string,
                content: item.markdown as string,
              }))
            : [];

          this.logger.debug(`Pages: ${JSON.stringify(pages, null, 2)}`);

          const checks = await Promise.all(
            pages.map((page) => this.checkIfRelevant(page.content))
          );

          pages = pages.filter((_, i) => checks[i].isPossiblyRelevant);
          return pages;
        }

        // 2️⃣ SINGLE‑PAGE branch ────────────────────────────────────────
        this.logger.debug(`Starting to scrape: ${url}`);
        const scrapeResponseOne = (await this.app.scrapeUrl(url, {
          formats,
          excludeTags: [
            "img",
            "svg",
            "a",
            "iframe",
            "script",
            "style",
            "br",
          ],
        })) as ScrapeResponse<any, never>;
        this.logger.debug(`Successfully scraped: ${url}`);

        if (scrapeResponseOne.markdown) {
          const isRelevant = await this.checkIfRelevant(
            scrapeResponseOne.markdown
          );
          if (isRelevant.isPossiblyRelevant) {
            return [
              {
                url,
                content: scrapeResponseOne.markdown,
              },
            ];
          }
        } else {
          this.logger.debug("No markdown found in scrape response");
        }
        return [];
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          // Rate limit hit
          const retryAfter = parseInt(
            error.response.headers["retry-after"] || "5",
            10
          );
          this.logger.warn(
            `Rate limit reached. Retrying after ${retryAfter} seconds... (attempt ${
              retries + 1
            }/${maxRetries})`
          );

          if (retries >= maxRetries) {
            this.logger.error("Max retries exceeded for rate limit.");
            throw new Error(
              `Rate limit exceeded and max retries reached: ${error.message}`
            );
          }

          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          retries++;
        } else {
          // Some other error
          this.logger.error(`Error scraping ${url}: ${error.message}`);
          throw error;
        }
      }
    }

    // If we exit the loop without returning, throw an error
    throw new Error(`Failed to scrape ${url} after ${maxRetries} retries.`);
  }
}
