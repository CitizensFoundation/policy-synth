import { SearchWebProcessor } from "@policysynth/agents/solutions/web/searchWeb.js";

export class ResearchWeb extends SearchWebProcessor {
  constructor(memory: PsSmarterCrowdsourcingMemoryData) {
    super(undefined as any, memory);
  }

  async search(searchQueries: string[]) {
    this.logger.info("Searching the web");
    this.logger.info(`Search queries: ${JSON.stringify(searchQueries)}`);
    this.seenUrls = new Map();

    const results = await this.getQueryResults(
      searchQueries,
      "webScanner"
    );

    return results.searchResults;
  }
}
