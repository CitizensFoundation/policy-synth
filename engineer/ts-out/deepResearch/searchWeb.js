import { BaseSearchWebAgent } from "@policysynth/agents/deepResearch/searchWeb.js";
export class ResearchWeb extends BaseSearchWebAgent {
    constructor(memory) {
        super();
    }
    async search(searchQueries) {
        this.logger.info("Searching the web");
        this.logger.info(`Search queries: ${JSON.stringify(searchQueries)}`);
        this.seenUrls = new Map();
        const results = await this.getQueryResults(searchQueries, "webScanner", 20);
        return results.searchResults;
    }
}
//# sourceMappingURL=searchWeb.js.map