import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class FirecrawlScrapeAndCrawlerAgent extends PolicySynthAgent {
    needsAiModel: boolean;
    private app;
    crawlPageLimit: number;
    constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number);
    private checkIfRelevant;
    /**
     * Scrape a URL using Firecrawl. If rate-limited (429), it will retry
     * after the time specified by the Retry-After header.
     *
     * @param url - The URL to scrape
     * @param formats - An array of formats to request, e.g. ['markdown', 'html']
     * @param maxRetries - Maximum number of retries upon rate limits
     * @returns The scrape response from Firecrawl
     */
    scrapeUrl(url: string, formats: ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract")[] | undefined, maxRetries: number | undefined, crawlUrlIfNotPdf: boolean): Promise<string[]>;
}
//# sourceMappingURL=firecrawlExtractor.d.ts.map