import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { SearchQueriesGenerator } from "./searchQueriesGenerator.js";
import { SearchQueriesRanker } from "./searchQueriesRanker.js";
import { ResearchWeb } from "./searchWeb.js";
import { SearchResultsRanker } from "./searchResultsRanker.js";
import { WebPageScanner } from "./webPageScanner.js";
import { PsEngineerWebContentFilter } from "./webPageContentFilter.js";
import { PsEngineerWebContentRanker } from "./webPageContentRanker.js";
import fs from "fs";
export class PsEngineerBaseWebResearchAgent extends PolicySynthScAgentBase {
    numberOfQueriesToGenerate = 12;
    percentOfQueriesToSearch = 0.25;
    percentOfResultsToScan = 0.3;
    maxTopContentResultsToUse = 6;
    useDebugCache = false;
    debugCache = undefined;
    debugCacheVersion = "V9";
    async doWebResearch() {
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
                    console.log("Cache file does not exist");
                }
            }
            catch (err) {
                console.error(`Error reading cache file: ${err}`);
            }
            if (this.debugCache) {
                return this.debugCache;
            }
        }
        try {
            console.log(`In web research: ${this.searchInstructions}`);
            const searchQueriesGenerator = new SearchQueriesGenerator(this.memory, this.numberOfQueriesToGenerate, this.searchInstructions);
            const searchQueries = await searchQueriesGenerator.generateSearchQueries();
            this.logger.info(`Generated ${searchQueries.length} search queries`);
            // Rank search queries
            this.logger.info("Pairwise Ranking Search Queries");
            const searchQueriesRanker = new SearchQueriesRanker(this.memory);
            const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries(searchQueries, this.searchInstructions);
            this.logger.info("Pairwise Ranking Completed");
            const queriesToSearch = rankedSearchQueries.slice(0, Math.floor(rankedSearchQueries.length * this.percentOfQueriesToSearch));
            // Search the web
            this.logger.info("Searching the Web...");
            const webSearch = new ResearchWeb(this.memory);
            const searchResults = await webSearch.search(queriesToSearch);
            this.logger.info(`Found ${searchResults.length} Web Pages`);
            // Rank search results
            this.logger.info("Pairwise Ranking Search Results");
            const searchResultsRanker = new SearchResultsRanker(this.memory);
            const rankedSearchResults = await searchResultsRanker.rankSearchResults(searchResults, this.searchInstructions, searchResults.length * 10);
            this.logger.info("Pairwise Ranking Completed");
            const searchResultsToScan = rankedSearchResults.slice(0, Math.floor(rankedSearchResults.length * this.percentOfResultsToScan));
            // Scan and Research Web pages
            this.logger.info("Scan and Research Web pages");
            const webPageResearch = new WebPageScanner(this.memory, this.searchInstructions);
            let webScanResults = await webPageResearch.scan(searchResultsToScan.map((i) => i.url), this.scanType);
            this.logger.info("Website Scanning Completed", true);
            console.log(`webScan: (${webScanResults.length}) ${JSON.stringify(webScanResults, null, 2)}`);
            const filter = new PsEngineerWebContentFilter(this.memory);
            webScanResults = await filter.filterContent(webScanResults);
            if (webScanResults.length > this.maxTopContentResultsToUse) {
                const ranker = new PsEngineerWebContentRanker(this.memory);
                webScanResults = await ranker.rankWebContent(webScanResults, this.searchInstructions, searchResults.length * 10);
            }
            const topWebScanResults = webScanResults.slice(0, this.maxTopContentResultsToUse);
            console.log("Top Web Scan Results:", topWebScanResults);
            if (this.useDebugCache) {
                try {
                    fs.writeFileSync(cacheDebugFilePath, JSON.stringify(topWebScanResults, null, 2));
                }
                catch (err) {
                    console.error(`Error writing cache file: ${err}`);
                }
            }
            return topWebScanResults;
        }
        catch (err) {
            console.error(`Error in search the web: ${err}`);
        }
    }
}
//# sourceMappingURL=baseResearchAgent.js.map