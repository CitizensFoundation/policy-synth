import {
  FirecrawlSearchApi,
  selectSearchProvider,
} from "./firecrawlSearchApi.js";
import { BingSearchApi } from "./bingSearchApi.js";
import { GoogleSearchApi } from "./googleSearchApi.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";

export class BaseSearchWebAgent extends PolicySynthAgentBase {
  readonly firecrawlSearchApi = new FirecrawlSearchApi();
  seenUrls: Map<string, Set<string>> = new Map();

  async callSearchApi(
    query: string,
    numberOfResults: number,
    options: PsSearchOptions = {},
  ): Promise<PsSearchResultItem[]> {
    const provider = selectSearchProvider();
    if (provider === "firecrawl")
      return this.firecrawlSearchApi.search(query, numberOfResults, options);
    if (provider === "google")
      return new GoogleSearchApi().search(query, numberOfResults, options);
    return new BingSearchApi().search(query, numberOfResults, options);
  }

  async getQueryResults(
    queriesToSearch: string[],
    id: string,
    numberOfResults: number = 10,
    options: PsSearchOptions = {},
  ) {
    let searchResults: PsSearchResultItem[] = [];

    for (let q = 0; q < queriesToSearch.length; q++) {
      const generalSearchData = await this.callSearchApi(
        queriesToSearch[q],
        numberOfResults,
        options,
      );

      if (generalSearchData) {
        searchResults = [...searchResults, ...generalSearchData];
      } else {
        this.logger.error("No search results");
      }

      this.logger.debug("Got Search Results 2");

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
}
