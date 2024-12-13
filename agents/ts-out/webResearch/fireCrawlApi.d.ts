import { PolicySynthAgent } from "../base/agent.js";
import { PsAgent } from "../dbModels/agent.js";
export declare class FirecrawlScrapeAgent extends PolicySynthAgent {
    needsAiModel: boolean;
    private app;
    crawlPageLimit: number;
    constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number);
    /**
     * Extracts the primary domain (e.g. "example.com") from a given URL.
     *
     * Uses tldts to handle various domain structures and TLDs.
     */
    private getDomainAndPath;
    private checkIfLegalOrPrivacyPolicy;
    /**
     * Scrape a URL using Firecrawl. If rate-limited (429), it will retry
     * after the time specified by the Retry-After header.
     *
     * @param url - The URL to scrape
     * @param formats - An array of formats to request, e.g. ['markdown', 'html']
     * @param maxRetries - Maximum number of retries upon rate limits
     * @returns The scrape response from Firecrawl
     */
    scrapeUrl(url: string, formats?: ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract")[], maxRetries?: number, skipImages?: boolean, crawlIfDomainIs?: string | undefined): Promise<any>;
}
//# sourceMappingURL=fireCrawlApi.d.ts.map