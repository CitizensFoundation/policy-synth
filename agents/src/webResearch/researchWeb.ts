import { SearchWebProcessor } from "../solutions/web/searchWeb.js";

export class ResearchWeb extends SearchWebProcessor {
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
