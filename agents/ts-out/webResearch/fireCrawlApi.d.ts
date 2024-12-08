import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export declare class FirecrawlScrapeAgent extends PolicySynthSimpleAgentBase {
    needsAiModel: boolean;
    private app;
    constructor();
    /**
     * Scrape a URL using Firecrawl. If rate-limited (429), it will retry
     * after the time specified by the Retry-After header.
     *
     * @param url - The URL to scrape
     * @param formats - An array of formats to request, e.g. ['markdown', 'html']
     * @param maxRetries - Maximum number of retries upon rate limits
     * @returns The scrape response from Firecrawl
     */
    scrapeUrl(url: string, formats?: ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract")[], maxRetries?: number): Promise<any>;
}
//# sourceMappingURL=fireCrawlApi.d.ts.map