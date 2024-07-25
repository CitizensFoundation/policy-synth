import { BaseSearchWebAgent } from "./searchWeb.js";

export class ResearchWeb extends BaseSearchWebAgent {
  constructor(memory: PsSimpleAgentMemoryData) {
    super();
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
