import { BaseSearchWebAgent } from "./searchWeb.js";
export class ResearchWeb extends BaseSearchWebAgent {
    constructor(memory) {
        super();
    }
    async search(searchQueries) {
        this.logger.info("Searching the web");
        this.seenUrls = new Map();
        const results = await this.getQueryResults(searchQueries, "webScanner");
        return results.searchResults;
    }
}
//# sourceMappingURL=researchWeb.js.map