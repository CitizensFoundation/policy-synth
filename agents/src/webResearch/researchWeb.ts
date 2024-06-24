import { SearchWebProcessor } from "../smarterCrowdsourcing/solutions/web/searchWeb.js";

export class ResearchWeb extends SearchWebProcessor {
  constructor(memory: PsSmarterCrowdsourcingMemoryData) {
    super(memory);
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
