import { GoogleSearchApi } from "@policysynth/agents/webResearch/googleSearchApi.js";
import { BingSearchApi } from "@policysynth/agents/webResearch/bingSearchApi.js";
import { SolutionsWebResearchSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsWebResearchAgent.js";

export class SearchWebAgent extends SolutionsWebResearchSmarterCrowdsourcingAgent {
  seenUrls!: Map<string, Set<string>>;

  async callSearchApi(query: string): Promise<PsSearchResultItem[]> {
    if (process.env.GOOGLE_SEARCH_API_KEY &&
        process.env.GOOGLE_SEARCH_API_CX_ID) {
        const googleSearchApi = new GoogleSearchApi();
        return await googleSearchApi.search(query);
    } else if (process.env.AZURE_BING_SEARCH_KEY) {
      const bingSearchApi = new BingSearchApi();
      return await bingSearchApi.search(query);
    } else {
      this.logger.error("Missing search API key");
      throw new Error("Missing search API key");
    }
  }

  async getQueryResults(queriesToSearch: string[], id: string) {
    let searchResults: PsSearchResultItem[] = [];

    for (let q = 0; q < queriesToSearch.length; q++) {
      const generalSearchData = await this.callSearchApi(queriesToSearch[q]);

      this.logger.debug(
        `Got Search Data 1: ${JSON.stringify(generalSearchData, null, 2)}`
      );

      if (generalSearchData) {
        searchResults = [...searchResults, ...generalSearchData];
      } else {
        this.logger.error("No search results");
      }

      this.logger.debug("Got Search Results 2");

      this.logger.debug(
        `Search Results Batch: ${JSON.stringify(searchResults, null, 2)}`
      );

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!this.seenUrls.has(id)) {
      this.seenUrls.set(id, new Set());
    }

    const seen = this.seenUrls.get(id);
    this.logger.debug(`Before dedup length ${searchResults.length}`);
    searchResults = searchResults.filter((v, i, a) => {
      const urlSeen = seen!.has(v.url);
      if (!urlSeen) {
        seen!.add(v.url);
      }
      return !urlSeen;
    });

    this.logger.debug(`After dedup length ${searchResults.length}`);

    return { searchResults };
  }

  async processSubProblems(searchQueryType: PsWebPageTypes) {
    for (
      let s = 0;
      s <
      Math.min(this.memory.subProblems.length, this.maxSubProblems);
      s++
    ) {
      let queriesToSearch = this.memory.subProblems[s].searchQueries[
        searchQueryType
      ].slice(0, this.maxTopQueriesToSearchPerType);

      const results = await this.getQueryResults(
        queriesToSearch,
        `subProblem_${s}`
      );

      if (!this.memory.subProblems[s].searchResults) {
        this.memory.subProblems[s].searchResults = {
          pages: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          },
        };
      }

      this.memory.subProblems[s].searchResults.pages[searchQueryType] =
        results.searchResults;

      await this.processEntities(s, searchQueryType);

      await this.saveMemory();
    }
  }

  async processEntities(
    subProblemIndex: number,
    searchQueryType: PsWebPageTypes
  ) {
    for (
      let e = 0;
      e <
      Math.min(
        this.memory.subProblems[subProblemIndex].entities.length,
        this.maxTopEntitiesToSearch
      );
      e++
    ) {
      let queriesToSearch = this.memory.subProblems[subProblemIndex].entities[
        e
      ].searchQueries![searchQueryType].slice(
        0,
        this.maxTopQueriesToSearchPerType
      );

      const results = await this.getQueryResults(
        queriesToSearch,
        `entity_${subProblemIndex}_${e}`
      );

      if (!this.memory.subProblems[subProblemIndex].entities[e].searchResults) {
        this.memory.subProblems[subProblemIndex].entities[e].searchResults = {
          pages: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          },
        };
      }

      this.memory.subProblems[subProblemIndex].entities[e].searchResults!.pages[
        searchQueryType
      ] = results.searchResults;

      await this.saveMemory();
    }
  }

  async processProblemStatement(searchQueryType: PsWebPageTypes) {
    let queriesToSearch = this.memory.problemStatement.searchQueries![
      searchQueryType
    ].slice(0, this.maxTopQueriesToSearchPerType);

    this.logger.info("Getting search data for problem statement");

    const results = await this.getQueryResults(
      queriesToSearch,
      "problemStatement"
    );

    this.memory.problemStatement.searchResults!.pages[searchQueryType] =
      results.searchResults;

    await this.saveMemory();
  }

  async process() {
    this.logger.info("Search Web Agent");
    this.seenUrls = new Map();

    super.process();

    try {
      for (const searchQueryType of [
        "general",
        "scientific",
        "openData",
        "news",
      ] as const) {
        await this.processProblemStatement(searchQueryType);
        await this.processSubProblems(searchQueryType as PsWebPageTypes);
      }
    } catch (error: any) {
      this.logger.error("Error processing web search");
      this.logger.error(error.stack || error);
      throw error;
    }

    this.logger.info("Finished processing web search");

    await this.saveMemory();
  }
}
