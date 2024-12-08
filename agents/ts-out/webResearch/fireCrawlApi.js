import FirecrawlApp from "@mendable/firecrawl-js";
import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export class FirecrawlScrapeAgent extends PolicySynthSimpleAgentBase {
    needsAiModel = false;
    app;
    constructor() {
        super();
        const apiKey = process.env.FIRECRAWL_API_KEY;
        if (!apiKey) {
            throw new Error("Missing FIRECRAWL_API_KEY environment variable");
        }
        this.app = new FirecrawlApp({ apiKey });
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
    async scrapeUrl(url, formats = ["markdown", "rawHtml"], maxRetries = 3) {
        let retries = 0;
        while (retries <= maxRetries) {
            try {
                this.logger.debug(`Attempting to scrape: ${url}, try #${retries + 1}`);
                const scrapeResponse = await this.app.scrapeUrl(url, { formats });
                if (!scrapeResponse.success) {
                    throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
                }
                this.logger.debug(`Successfully scraped: ${url}`);
                return scrapeResponse;
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
//# sourceMappingURL=fireCrawlApi.js.map