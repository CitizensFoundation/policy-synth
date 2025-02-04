import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
/**
 * Optional config interface for controlling how much searching/scanning to do
 */
export interface WebResearchConfig {
    numberOfQueriesToGenerate: number;
    percentOfQueriesToSearch: number;
    percentOfResultsToScan: number;
    maxTopContentResultsToUse: number;
}
/**
 * Upgraded agent class with a structure similar to your first example.
 * Extends the more robust PolicySynthAgent and includes debug caching,
 * separate instructions for searching/ranking/scanning, and concurrency limiting for any parallel tasks.
 */
export declare abstract class PsEngineerBaseWebResearchAgent extends PolicySynthAgent {
    /**
     * The text you feed into the search queries generator.
     */
    abstract searchInstructions: string;
    /**
     * Instructions used by the ranking sub-agents to rank queries, results, and content.
     */
    abstract rankingInstructions: string;
    /**
     * A system prompt or special instructions for your WebPageScanner.
     */
    abstract scanningSystemPrompt: string;
    /**
     * If you have a specialized type for scanning.
     */
    abstract scanType: PsEngineerWebResearchTypes;
    /**
     * Default numeric parameters for your approach.
     */
    numberOfQueriesToGenerate: number;
    percentOfQueriesToSearch: number;
    percentOfResultsToScan: number;
    maxTopContentResultsToUse: number;
    /**
     * Enables reading/writing a debug cache file from /tmp.
     */
    useDebugCache: boolean;
    debugCache: any[] | undefined;
    debugCacheVersion: string;
    /**
     * Optionally limit concurrency for certain parallel tasks (like scanning multiple pages).
     */
    private static readonly CONCURRENCY_LIMIT;
    /**
     * Main method to orchestrate the web research steps:
     * 1. Generate queries
     * 2. Rank queries
     * 3. Search the web
     * 4. Rank search results
     * 5. Scan top results
     * 6. Filter results
     * 7. Rank final web content
     */
    doWebResearch(config?: Partial<WebResearchConfig>): Promise<any[]>;
}
//# sourceMappingURL=baseResearchAgent.d.ts.map