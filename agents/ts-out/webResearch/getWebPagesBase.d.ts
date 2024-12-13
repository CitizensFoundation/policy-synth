import { PolicySynthAgent } from "../base/agent.js";
import { PsAgent } from "../dbModels/agent.js";
type PageFormat = "rawHtml" | "markdown";
export declare class GetWebPagesBaseAgent extends PolicySynthAgent {
    private firecrawlApiKey?;
    private firecrawlAgent?;
    constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number);
    generateFileName(url: string, suffix: string): string;
    private getCacheDirectory;
    /**
     * Get cached data if available.
     */
    private getCachedData;
    /**
     * Cache data.
     */
    private cacheData;
    /**
     * Process PDF files (fallback if no Firecrawl).
     * Now uses Puppeteer to fetch the PDF file content.
     */
    private getAndProcessPdfFallback;
    /**
     * Process HTML using puppeteer (fallback if no Firecrawl).
     */
    private getAndProcessHtmlFallback;
    /**
     * Process page using Firecrawl API.
     * Fetches both rawHtml and markdown, caches them, and returns the requested format.
     * Works for both HTML and PDF URLs.
     */
    private getAndProcessWithFirecrawl;
    /**
     * Public method to get and process a single page.
     * If FIRECRAWL_API_KEY is set, uses Firecrawl (for both HTML and PDFs).
     * Otherwise, uses puppeteer for HTML and Puppeteer-based PDF fetching.
     *
     * @param url The URL to retrieve
     * @param format Which format to return. Only applies if Firecrawl is used. Puppeteer fallback always returns markdown.
     * @param crawlIfDomainIs If specified, only crawl if the current URL's domain matches this domain.
     */
    getAndProcessPage(url: string, format?: PageFormat, crawlIfDomainIs?: string | undefined): Promise<string | string[]>;
}
export {};
//# sourceMappingURL=getWebPagesBase.d.ts.map