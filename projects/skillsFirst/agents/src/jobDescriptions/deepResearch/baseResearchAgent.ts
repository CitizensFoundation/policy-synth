import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { SearchQueriesGenerator } from "./searchQueriesGenerator.js";
import { SearchQueriesRanker } from "./searchQueriesRanker.js";
import { ResearchWeb } from "./searchWeb.js";
import { SearchResultsRanker } from "./searchResultsRanker.js";
import { WebPageScanner } from "./webPageScanner.js";
import { DeepResearchWebContentRanker } from "./webPageContentRanker.js";
import fs from "fs";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { DeduplicationByKeysAgent } from "./deduplicateByKeys.js";
import pLimit from "p-limit";

export abstract class BaseDeepResearchAgent extends PolicySynthAgent {
  useDebugCache = false;
  debugCache: string[] | undefined = undefined;
  debugCacheVersion = "V13";

  declare memory: JobDescriptionMemoryData;

  defaultModelSize = PsAiModelSize.Medium;

  abstract searchInstructions: string;
  abstract rankingInstructions: string;
  abstract scanningSystemPrompt: string;
  abstract scanType: DeepResearchWebResearchTypes;
  abstract attributeNameToUseForDedup: string;
  abstract licenseType: string;

  disableRanking = false;

  skipScanning = true;

  findOrganizationUrlsAndLogos = false;

  filterOutNonCompetitors = false;

  useSmallModelForSearchResultsRanking = false;

  statusPrefix: string = "";

  urlToCrawl: string | undefined = undefined;

  convertFromCamelCaseToReadable(dataType: string) {
    // Handle empty or null strings
    if (!dataType) return "";

    // Convert camelCase/PascalCase to space-separated words
    const spaced = dataType
      // Handle acronyms (e.g., "JSON", "API")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      // Handle regular camelCase
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      // Convert to lowercase and capitalize first letter of each word
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (letter) => letter.toUpperCase());

    return spaced.trim();
  }

  private static readonly CONCURRENCY_LIMIT = 10;



  async doWebResearch(
    licenseType: string,
    config: any,//WebResearchConfig,
    dataType: string | undefined = undefined,
    statusPrefix: string = ""
  ) {
    const cacheDebugFilePath = `/tmp/${this.scanType}_DeepAgentWebResearchDebugCache_${this.debugCacheVersion}.json`;
    const totalProgressRange = this.endProgress - this.startProgress;
    this.licenseType = licenseType;

    this.statusPrefix = statusPrefix;

    // Use the config parameters instead of class properties
    let {
      numberOfQueriesToGenerate,
      percentOfQueriesToSearch,
      percentOfResultsToScan,
      maxTopContentResultsToUse,
    } = config;

    if (this.useDebugCache) {
      try {
        if (fs.existsSync(cacheDebugFilePath)) {
          const cacheFileContent = fs.readFileSync(cacheDebugFilePath, {
            encoding: "utf8",
          });
          this.debugCache = JSON.parse(cacheFileContent);
        } else {
          console.log("Cache file does not exist");
        }
      } catch (err) {
        console.error(`Error reading cache file: ${err}`);
      }

      if (this.debugCache) {
        return this.debugCache;
      }
    }

    try {
      console.log(`In web research: ${this.searchInstructions}`);

      await this.updateRangedProgress(
        this.startProgress + 0.05 * totalProgressRange,
        `${statusPrefix}Creating Search Queries`
      );

      const generatorStartProgress =
        this.startProgress + 0.0 * totalProgressRange;
      const generatorEndProgress =
        this.startProgress + 0.3 * totalProgressRange;

      const searchQueriesGenerator = new SearchQueriesGenerator(
        this.agent,
        this.memory as JobDescriptionMemoryData,
        numberOfQueriesToGenerate,
        this.searchInstructions,
        generatorStartProgress,
        generatorEndProgress,
        licenseType
      );

      const searchQueries =
        await searchQueriesGenerator.generateSearchQueries();
      this.logger.info(`Generated ${searchQueries.length} search queries`);

      // Rank search queries
      this.logger.info("Pairwise Ranking Search Queries");

      if (dataType) {
        await this.updateRangedProgress(
          this.startProgress + 0.3 * totalProgressRange,
          `${statusPrefix}Ranking Search Queries (${this.convertFromCamelCaseToReadable(
            dataType
          )})`
        );
      } else {
        await this.updateRangedProgress(
          this.startProgress + 0.3 * totalProgressRange,
          `${statusPrefix}Ranking Search Queries`
        );
      }

      // Define the percentage range you want to allocate to the sub-agent
      const subAgentStartPercentage = 0.3; // 30%
      const subAgentEndPercentage = 0.4; // 40%

      // Calculate the sub-agent's absolute progress range
      const subAgentStartProgress =
        this.startProgress + subAgentStartPercentage * totalProgressRange;
      const subAgentEndProgress =
        this.startProgress + subAgentEndPercentage * totalProgressRange;

      const searchQueriesRanker = new SearchQueriesRanker(
        this.agent,
        this.memory as JobDescriptionMemoryData,
        undefined,
        subAgentStartProgress,
        subAgentEndProgress,
        licenseType
      );

      const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries(
        searchQueries,
        this.rankingInstructions
      );

      this.logger.info(
        "-----------------------------> Pairwise Ranking Completed: " +
          JSON.stringify(rankedSearchQueries, null, 2)
      );

      const queriesToSearch = rankedSearchQueries.slice(
        0,
        Math.floor(rankedSearchQueries.length * percentOfQueriesToSearch)
      );

      // Search the web
      this.logger.info("Searching the Web...");

      await this.updateRangedProgress(
        this.startProgress + 0.4 * totalProgressRange,
        `${statusPrefix}Searching the Web`
      );

      const webSearch = new ResearchWeb(this.memory as PsAgentMemoryData);
      const searchResults = await webSearch.search(queriesToSearch);
      this.logger.info(`Found ${searchResults.length} Web Pages`);

      // Rank search results
      this.logger.info("Pairwise Ranking Search Results");

      if (dataType) {
        await this.updateRangedProgress(
          this.startProgress + 0.5 * totalProgressRange,
          `${statusPrefix}Ranking Search Results (${this.convertFromCamelCaseToReadable(
            dataType
          )})`
        );
      } else {
        await this.updateRangedProgress(
          this.startProgress + 0.5 * totalProgressRange,
          `${statusPrefix}Ranking Search Results`
        );
      }

      const resultsRankerStartProgress =
        this.startProgress + 0.5 * totalProgressRange;
      const resultsRankerEndProgress =
        this.startProgress + 0.65 * totalProgressRange;

      const searchResultsRanker = new SearchResultsRanker(
        this.agent,
        this.memory as JobDescriptionMemoryData,
        undefined,
        resultsRankerStartProgress,
        resultsRankerEndProgress,
        licenseType,
        this.useSmallModelForSearchResultsRanking
      );

      const rankedSearchResults = await searchResultsRanker.rankSearchResults(
        searchResults,
        this.rankingInstructions
      );
      this.logger.info(
        "Pairwise Ranking Completed length: " + rankedSearchResults.length
      );

      console.log(
        `ranked searchResults: (${rankedSearchResults.length}) ${JSON.stringify(
          rankedSearchResults,
          null,
          2
        )}`
      );

      const searchResultsToScan = rankedSearchResults.slice(
        0,
        Math.floor(rankedSearchResults.length * percentOfResultsToScan)
      );

      if (this.skipScanning) {
        return searchResultsToScan;
      }

      // Scan and Research Web pages
      this.logger.info(
        "Scan and Research Web pages length: " + searchResultsToScan.length
      );

      await this.updateRangedProgress(80, `${statusPrefix}Scanning Web Pages`);
      const scannerStartProgress =
        this.startProgress + 0.65 * totalProgressRange;
      const scannerEndProgress = this.startProgress + 0.8 * totalProgressRange;

      const webPageResearch = new WebPageScanner(
        this.agent,
        this.memory as JobDescriptionMemoryData,
        scannerStartProgress,
        scannerEndProgress,
        this.searchInstructions,
        this.scanningSystemPrompt
      );

      let webScanResults = await webPageResearch.scan(
        searchResultsToScan.map((i) => i.url),
        this.scanType,
        this.urlToCrawl
      );

      this.logger.info("Website Scanning Completed", true);

      console.log(`webScanResults before dedup: ${webScanResults.length}`);

      // First flatten the array
      webScanResults = (webScanResults as any[][]).flat();

      // Then filter out any empty or null values
      webScanResults = webScanResults.filter(
        (item) => item && Object.keys(item).length > 0
      );

      if (this.attributeNameToUseForDedup === "organizationName") {
        webScanResults = webScanResults.filter((item) => {
          if (!item.organizationName || item.organizationName.trim() === "") {
            this.logger.info(
              `Removing item with no name: ${JSON.stringify(item)}`
            );
            return false;
          }
          return true;
        });
      }

      console.log(
        `webScan: (${webScanResults.length}) ${JSON.stringify(
          webScanResults,
          null,
          2
        )}`
      );

      if (this.findOrganizationUrlsAndLogos && this.attributeNameToUseForDedup) {
        const dedupAgent = new DeduplicationByKeysAgent<any>(
          this.agent,
          this.memory,
          this.startProgress,
          this.endProgress
        );

        await this.updateRangedProgress(
          this.startProgress + 0.8 * totalProgressRange,
          `${statusPrefix}Deduplicating Web Content`
        );

        webScanResults = await dedupAgent.deduplicateItems(
          webScanResults,
          (item) => {
            const val = item[this.attributeNameToUseForDedup!];
            // Ensure we always return a string key:
            return typeof val === "string"
              ? val.toLowerCase().trim()
              : JSON.stringify(val);
          },
          undefined,
          this.attributeNameToUseForDedup === "organizationName"
        );

        console.log(`webScanResults after LLM dedup: ${webScanResults.length}`);

        console.log(
          `webScan: (${webScanResults.length}) ${JSON.stringify(
            webScanResults,
            null,
            2
          )}`
        );
      }

      if (!this.disableRanking) {
        const contentRankerStartProgress =
          this.startProgress + 0.8 * totalProgressRange;
        const contentRankerEndProgress = this.endProgress;

        const webContentRanker = new DeepResearchWebContentRanker(
          this.agent,
          this.memory as JobDescriptionMemoryData,
          undefined,
          contentRankerStartProgress,
          contentRankerEndProgress
        );

        await this.updateRangedProgress(
          this.startProgress + 0.8 * totalProgressRange,
          `${statusPrefix}Ranking Web Content`
        );

        webScanResults = await webContentRanker.rankWebContent(
          webScanResults,
          this.rankingInstructions
        );

        let topWebScanResults = webScanResults.slice(
          0,
          maxTopContentResultsToUse
        );

        if (this.useDebugCache) {
          try {
            fs.writeFileSync(
              cacheDebugFilePath,
              JSON.stringify(topWebScanResults, null, 2)
            );
          } catch (err) {
            console.error(`Error writing cache file: ${err}`);
          }
        }

        console.log("Top Web Scan Results:", topWebScanResults);

        await this.updateRangedProgress(
          this.endProgress,
          `${statusPrefix}Web Research Completed`
        );
        return topWebScanResults;
      } else {
        await this.updateRangedProgress(
          this.endProgress,
          `${statusPrefix}Web Research Completed`
        );
        return webScanResults;
      }
    } catch (err) {
      console.error(`Error in search the web: ${err}`);
      throw err;
    }
  }
}
