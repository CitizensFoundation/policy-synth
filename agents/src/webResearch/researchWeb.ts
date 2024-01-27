import { SearchWebProcessor } from "../solutions/web/searchWeb.js";

export class ResearchWeb extends SearchWebProcessor {
  constructor(memory: PsBaseMemoryData) {
    super(undefined as any, memory);
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
