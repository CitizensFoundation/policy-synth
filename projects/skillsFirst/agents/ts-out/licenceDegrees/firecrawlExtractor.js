import FirecrawlApp from "@mendable/firecrawl-js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
export class FirecrawlScrapeAndCrawlerAgent extends PolicySynthAgent {
    needsAiModel = false;
    app;
    crawlPageLimit = 10;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        const apiKey = process.env.FIRECRAWL_API_KEY;
        if (!apiKey) {
            throw new Error("Missing FIRECRAWL_API_KEY environment variable");
        }
        this.app = new FirecrawlApp({ apiKey });
    }
    async checkIfRelevant(document) {
        const messages = [
            {
                role: "system",
                message: `You are a helpful relevance checker. Determine if the provided document is relevant to the user's request.

Instructions:

If DocumentToAnalyze has any information about occupational licensing requirements in New Jersey then it is relevant.
Focus on license degree requirements that require a college degree (Associate's, Bachelor's, Graduate/Professional).

If the DocumentToAnalyze is a legal privacy policy or terms of service only, then return true.

output only JSON:
  {
   "isRelevant": boolean,
   "reasoning": string
  }
  `,
            },
            {
                role: "user",
                message: `<DocumentToAnalyze>${document}</DocumentToAnalyze>

Your JSON output:`,
            },
        ];
        try {
            const result = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages));
            if (result.isRelevant) {
                this.logger.debug("-------> filtering out");
                this.logger.debug(document);
                this.logger.debug("-------> end of filtering out");
            }
            else {
                this.logger.debug("-------> not filtering out");
            }
            return result;
        }
        catch (error) {
            this.logger.warn("checkIfRelevant: Model did not return a valid JSON object. Falling back to false.");
            return { isRelevant: false };
        }
    }
    /**
     * Scrape a URL using Firecrawl. If rate-limited (429), it will retry
     * after the time specified by the Retry-After header.
     *
     * @param url - The URL to scrape
     * @param formats - An array of formats to request, e.g. ['markdown', 'html']
     * @param maxRetries - Maximum number of retries upon rate limits
     * @returns The scrape response from Firecrawl
     */
    async scrapeUrl(url, formats = ["markdown", "rawHtml"], maxRetries = 3, crawlUrlIfNotPdf) {
        let retries = 0;
        while (retries <= maxRetries) {
            try {
                this.logger.debug(`Attempting to scrape: ${url}, try #${retries + 1}`);
                let scrapeResponse;
                // If a reference domain is specified, only crawl if the current URL's domain matches
                // that of the reference domain. Using the more robust domain extraction here.
                if (crawlUrlIfNotPdf && !url.endsWith(".pdf")) {
                    this.logger.debug(`Crawling ${url} because it is not a PDF`);
                    scrapeResponse = await this.app.crawlUrl(url, {
                        limit: this.crawlPageLimit,
                        scrapeOptions: {
                            formats,
                            excludeTags: ["img", "svg", "a", "iframe", "script", "style", "br"]
                        },
                    });
                    this.logger.debug(`Crawl response length: ${Object.keys(scrapeResponse).length}`);
                    if (!scrapeResponse.success) {
                        throw new Error(`Failed to crawl: ${scrapeResponse.error}`);
                    }
                    let allMarkdownObjects = scrapeResponse.data
                        ? scrapeResponse.data.map((item) => item.markdown)
                        : [];
                    const checks = await Promise.all(allMarkdownObjects.map((doc) => this.checkIfRelevant(doc)));
                    allMarkdownObjects = allMarkdownObjects.filter((_, i) => checks[i].isRelevant);
                    return allMarkdownObjects;
                }
                else {
                    let scrapeResponseOne;
                    this.logger.debug(`Starting to scrape: ${url}`);
                    scrapeResponseOne = await this.app.scrapeUrl(url, {
                        formats,
                        excludeTags: ["img", "svg", "a", "iframe", "script", "style", "br"]
                    });
                    this.logger.debug(`Successfully scraped: ${url}`);
                    if (scrapeResponseOne.markdown) {
                        const isRelevant = await this.checkIfRelevant(scrapeResponseOne.markdown);
                        if (isRelevant.isRelevant) {
                            return [scrapeResponseOne.markdown];
                        }
                    }
                    else {
                        this.logger.debug("No markdown found in scrape response");
                        return [];
                    }
                }
            }
            catch (error) {
                if (error.response && error.response.status === 429) {
                    // Rate limit hit
                    const retryAfter = parseInt(error.response.headers["retry-after"] || "5", 10);
                    this.logger.warn(`Rate limit reached. Retrying after ${retryAfter} seconds... (attempt ${retries + 1}/${maxRetries})`);
                    if (retries >= maxRetries) {
                        this.logger.error("Max retries exceeded for rate limit.");
                        throw new Error(`Rate limit exceeded and max retries reached: ${error.message}`);
                    }
                    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
                    retries++;
                }
                else if ( /*error.response && error.response.status !== 403*/false) {
                    /*const fallbackScraper = new WebScraper();
                    let fallbackResponse;
                    try {
                      fallbackResponse = await fallbackScraper.scrapeUrl(url);
                      if (fallbackResponse.success) {
                        return {
                          markdown: fallbackResponse.data.rawHtml,
                          rawHtml: fallbackResponse.data.rawHtml,
                          metadata: {
                            source: "fallback",
                          },
                        };
                      }
                    } catch (fallbackErr: any) {
                      this.logger.error("Fallback also failed: " + fallbackErr.message);
                      throw fallbackErr; // re-throw
                    }*/
                }
                else {
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
//# sourceMappingURL=firecrawlExtractor.js.map