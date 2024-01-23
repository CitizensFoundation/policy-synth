import { SearchWebProcessor } from "@policysynth/agents";

export class SearchWebScanner extends SearchWebProcessor {
  constructor() {
    super(undefined as any, undefined as any);
  }

  async search(searchQueries: string[]) {
    this.logger.info("Searching the web");
    this.seenUrls = new Map();

    const results = await this.getQueryResults(
      searchQueries,
      "webScanner"
    );

    return results.searchResults;
  }
}
