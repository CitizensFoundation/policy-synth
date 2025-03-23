import FirecrawlApp from "@mendable/firecrawl-js";
import { PolicySynthAgent } from "../base/agent.js";
import { parse } from "tldts";
import { PsAiModelType } from "../aiModelTypes.js";
import { PsAiModelSize } from "../aiModelTypes.js";
export class FirecrawlScrapeAgent extends PolicySynthAgent {
    needsAiModel = false;
    app;
    crawlPageLimit = 50;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        const apiKey = process.env.FIRECRAWL_API_KEY;
        if (!apiKey) {
            throw new Error("Missing FIRECRAWL_API_KEY environment variable");
        }
        this.app = new FirecrawlApp({ apiKey });
    }
    /**
     * Extracts the primary domain (e.g. "example.com") from a given URL.
     *
     * Uses tldts to handle various domain structures and TLDs.
     */
    getDomainAndPath(url) {
        try {
            // Use tldts to get the base domain.
            const parsed = parse(url);
            // Use the standard URL constructor to parse the full URL, including paths.
            const u = new URL(url);
            // The domain from tldts gives you the base domain ("example.com").
            // The URL object gives you the pathname ("/blah").
            const domain = parsed.domain ?? u.hostname;
            const path = u.pathname;
            // Combine the domain with the path.
            // If you want to include the subdomain (like "www"), you can use u.hostname instead of domain.
            return `${domain}${path}`;
        }
        catch (error) {
            this.logger.error(`Error parsing URL ${url}: ${error}`);
            return url; // fallback to the raw URL if parsing fails
        }
    }
    async checkIfLegalOrPrivacyPolicy(document) {
        const messages = [
            {
                role: "system",
                message: `You are a helpful assistant. Determine if the provided document is a legal privacy policy or general terms of service.

Instructions:

If DocumentToAnalyze a mix of content where there is some legal privacy policy or terms of service content, but also other significant content,
then return false.

If the DocumentToAnalyze a legal privacy policy or terms of service only, then return true.

output only JSON:
  { "isOnlyPrivacyPolicyOrTermsOfService": boolean }
  `,
            },
            {
                role: "user",
                message: `<DocumentToAnalyze>${document}</DocumentToAnalyze>

Is this only a privacy policy or terms of service for a website?
Your JSON output:`,
            },
        ];
        try {
            const result = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Small, messages));
            if (result.isOnlyPrivacyPolicyOrTermsOfService) {
                this.logger.debug("-------> filtering out legal or privacy policy");
                this.logger.debug(document);
                this.logger.debug("-------> end of legal or privacy policy");
            }
            else {
                this.logger.debug("-------> not a legal or privacy policy document");
            }
            return result;
        }
        catch (error) {
            this.logger.warn("checkIfLegalOrPrivacyPolicy: Model did not return a valid JSON object. Falling back to false.");
            return { isOnlyPrivacyPolicyOrTermsOfService: false };
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
    async scrapeUrl(url, formats = ["markdown", "rawHtml"], maxRetries = 3, skipImages = false, crawlIfDomainIs = undefined) {
        let retries = 0;
        const targetDomain = crawlIfDomainIs
            ? this.getDomainAndPath(crawlIfDomainIs)
            : undefined;
        const currentDomain = this.getDomainAndPath(url);
        while (retries <= maxRetries) {
            try {
                this.logger.debug(`Attempting to scrape: ${url}, try #${retries + 1}`);
                let scrapeResponse;
                // If a reference domain is specified, only crawl if the current URL's domain matches
                // that of the reference domain. Using the more robust domain extraction here.
                if (targetDomain && currentDomain === targetDomain) {
                    this.logger.debug(`Crawling ${url} because it matches ${targetDomain}`);
                    scrapeResponse = await this.app.crawlUrl(url, {
                        limit: this.crawlPageLimit,
                        scrapeOptions: {
                            formats,
                            excludeTags: skipImages
                                ? ["img", "svg", "a", "iframe", "script", "style", "br"]
                                : [],
                        },
                    });
                    this.logger.debug(`Crawl response length: ${Object.keys(scrapeResponse).length}`);
                    if (!scrapeResponse.success) {
                        throw new Error(`Failed to crawl: ${scrapeResponse.error}`);
                    }
                    let allMarkdownObjects = scrapeResponse.data
                        ? scrapeResponse.data.map((item) => item.markdown)
                        : [];
                    const checks = await Promise.all(allMarkdownObjects.map((doc) => this.checkIfLegalOrPrivacyPolicy(doc)));
                    allMarkdownObjects = allMarkdownObjects.filter((_, i) => !checks[i].isOnlyPrivacyPolicyOrTermsOfService);
                    scrapeResponse.markdownArray = allMarkdownObjects;
                    scrapeResponse.rawHtml = scrapeResponse.data
                        ? scrapeResponse.data.map((item) => item.rawHtml).join("\n\n")
                        : "";
                }
                else {
                    this.logger.debug(`Starting to scrape: ${url}`);
                    scrapeResponse = await this.app.scrapeUrl(url, {
                        formats,
                        excludeTags: skipImages
                            ? ["img", "svg", "a", "iframe", "script", "style", "br"]
                            : [],
                    });
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
//# sourceMappingURL=fireCrawlApi.js.map