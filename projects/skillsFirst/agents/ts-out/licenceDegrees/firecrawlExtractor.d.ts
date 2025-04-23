import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
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
export declare class FirecrawlScrapeAndCrawlerAgent extends PolicySynthAgent {
    needsAiModel: boolean;
    private app;
    licenseType: string;
    crawlPageLimit: number;
    constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number, licenseType: string);
    private checkIfRelevant;
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
    scrapeUrl(url: string, formats: ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract")[] | undefined, maxRetries: number | undefined, crawlUrlIfNotPdf: boolean): Promise<ScrapedPage[]>;
}
//# sourceMappingURL=firecrawlExtractor.d.ts.map