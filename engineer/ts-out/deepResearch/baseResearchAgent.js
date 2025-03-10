import fs from "fs";
import pLimit from "p-limit";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { SearchQueriesGenerator } from "./searchQueriesGenerator.js";
import { SearchQueriesRanker } from "./searchQueriesRanker.js";
import { ResearchWeb } from "./searchWeb.js";
import { SearchResultsRanker } from "./searchResultsRanker.js";
import { WebPageScanner } from "./webPageScanner.js";
import { PsEngineerWebContentFilter } from "./webPageContentFilter.js";
import { PsEngineerWebContentRanker } from "./webPageContentRanker.js";
/**
 * Upgraded agent class with a structure similar to your first example.
 * Extends the more robust PolicySynthAgent and includes debug caching,
 * separate instructions for searching/ranking/scanning, and concurrency limiting for any parallel tasks.
 */
export class PsEngineerBaseWebResearchAgent extends PolicySynthAgent {
    /**
     * Default numeric parameters for your approach.
     */
    numberOfQueriesToGenerate = 10;
    percentOfQueriesToSearch = 0.2;
    percentOfResultsToScan = 0.2;
    maxTopContentResultsToUse = 3;
    /**
     * Enables reading/writing a debug cache file from /tmp.
     */
    useDebugCache = false;
    debugCache = undefined;
    debugCacheVersion = "V9";
    /**
     * Optionally limit concurrency for certain parallel tasks (like scanning multiple pages).
     */
    static CONCURRENCY_LIMIT = 10;
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
    async doWebResearch(config) {
        // Merge default settings with passed-in config
        const { numberOfQueriesToGenerate = this.numberOfQueriesToGenerate, percentOfQueriesToSearch = this.percentOfQueriesToSearch, percentOfResultsToScan = this.percentOfResultsToScan, maxTopContentResultsToUse = this.maxTopContentResultsToUse, } = config || {};
        // If you want to store or load from a debug cache:
        const cacheDebugFilePath = `/tmp/${this.scanType}_webResearchDebugCache_${this.debugCacheVersion}.json`;
        if (this.useDebugCache) {
            try {
                if (fs.existsSync(cacheDebugFilePath)) {
                    const cacheFileContent = fs.readFileSync(cacheDebugFilePath, {
                        encoding: "utf8",
                    });
                    this.debugCache = JSON.parse(cacheFileContent);
                }
                else {
                    this.logger.debug("Cache file does not exist");
                }
            }
            catch (err) {
                this.logger.error(`Error reading cache file: ${err}`);
            }
            if (this.debugCache) {
                // If debug cache is found, return it directly
                this.logger.info("Returning cached debug results.");
                return this.debugCache;
            }
        }
        try {
            this.logger.info(`In web research: ${this.searchInstructions}`);
            // 1) Generate Search Queries
            const searchQueriesGenerator = new SearchQueriesGenerator(this.memory, this.agent, 0, 100, numberOfQueriesToGenerate, this.searchInstructions);
            const searchQueries = await searchQueriesGenerator.generateSearchQueries();
            this.logger.info(`Generated ${searchQueries.length} search queries`);
            // 2) Rank Search Queries
            this.logger.info("Pairwise Ranking Search Queries");
            const searchQueriesRanker = new SearchQueriesRanker(this.agent, this.memory, 0, 100);
            const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries(searchQueries, this.rankingInstructions);
            this.logger.info("Search Queries Ranking Completed");
            const queriesToSearch = rankedSearchQueries.slice(0, Math.floor(rankedSearchQueries.length * percentOfQueriesToSearch));
            // 3) Search the Web
            this.logger.info("Searching the Web...");
            const webSearch = new ResearchWeb(this.memory);
            const searchResults = await webSearch.search(queriesToSearch);
            this.logger.info(`Found ${searchResults.length} Web Pages`);
            // 4) Rank Search Results
            this.logger.info("Pairwise Ranking Search Results");
            const searchResultsRanker = new SearchResultsRanker(this.agent, this.memory, 0, 100);
            const rankedSearchResults = await searchResultsRanker.rankSearchResults(searchResults, this.rankingInstructions);
            this.logger.info("Search Results Ranking Completed");
            const searchResultsToScan = rankedSearchResults.slice(0, Math.floor(rankedSearchResults.length * percentOfResultsToScan));
            // 5) Scan and Research Web pages
            this.logger.info(`Scanning up to ${searchResultsToScan.length} web pages for relevant content...`);
            // Example concurrency limit usage if you want to parallelize scanning:
            const limit = pLimit(PsEngineerBaseWebResearchAgent.CONCURRENCY_LIMIT);
            const webPageResearch = new WebPageScanner(this.agent, this.memory, 0, 100, this.scanningSystemPrompt);
            const currentCountStatus = { currentCount: 0, totalCount: searchResultsToScan.length };
            // Map each URL into a scanning promise, but limit concurrency
            let allScanResults = await Promise.all(searchResultsToScan.map((result) => limit(() => webPageResearch.scan([result.url], this.scanType, currentCountStatus))));
            // Flatten results if each scan() returns an array
            const webScanResultsFlat = allScanResults.flat();
            // Just include a string[] from .analysis
            let webScanResults = webScanResultsFlat.map((result) => result.analysis);
            this.logger.info("Website Scanning Completed.");
            this.logger.debug(`Raw webScanResults: (${webScanResults.length})\n` +
                JSON.stringify(webScanResults, null, 2));
            webScanResults = webScanResults.filter((result) => result.length > 250);
            this.logger.debug(`Filtered webScanResults length after length check: (${webScanResults.length})\n`);
            const useContentFilter = false;
            if (useContentFilter) {
                // 6) Filter out irrelevant content
                const filter = new PsEngineerWebContentFilter(this.agent, this.memory, 0, 100);
                webScanResults = await filter.filterContent(webScanResults);
            }
            // 7) Optionally rank the final web content if we have more than we need
            if (webScanResults.length > maxTopContentResultsToUse) {
                this.logger.info("Ranking Web Content to select the top results");
                const ranker = new PsEngineerWebContentRanker(this.agent, this.memory, 0, 100);
                webScanResults = await ranker.rankWebContent(webScanResults, this.rankingInstructions);
            }
            // Slice down to the top set you actually need
            const topWebScanResults = webScanResults.slice(0, maxTopContentResultsToUse);
            this.logger.info(`Top ${topWebScanResults.length} Web Scan Results: ` +
                JSON.stringify(topWebScanResults, null, 2));
            // If debug caching is enabled, write out results
            if (this.useDebugCache) {
                try {
                    fs.writeFileSync(cacheDebugFilePath, JSON.stringify(topWebScanResults, null, 2));
                    this.logger.info(`Debug cache saved to ${cacheDebugFilePath}`);
                }
                catch (err) {
                    this.logger.error(`Error writing cache file: ${err}`);
                }
            }
            return topWebScanResults;
        }
        catch (err) {
            this.logger.error(`Error in web research: ${err}`);
            throw err;
        }
    }
}
//# sourceMappingURL=baseResearchAgent.js.map