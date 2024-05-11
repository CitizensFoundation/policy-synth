import { SearchWebProcessor } from "@policysynth/agents/solutions/web/searchWeb.js";
export class ResearchWeb extends SearchWebProcessor {
    constructor(memory) {
        super(undefined, memory);
    }
    async search(searchQueries) {
        this.logger.info("Searching the web");
        this.seenUrls = new Map();
        const results = await this.getQueryResults(searchQueries, "webScanner");
        return results.searchResults;
    }
}
//# sourceMappingURL=searchWeb.js.map