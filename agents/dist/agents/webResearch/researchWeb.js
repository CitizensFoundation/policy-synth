import { SearchWebProcessor } from "../solutions/web/searchWeb.js";
export class ResearchWeb extends SearchWebProcessor {
    constructor() {
        super(undefined, undefined);
    }
    async search(searchQueries) {
        this.logger.info("Searching the web");
        this.seenUrls = new Map();
        const results = await this.getQueryResults(searchQueries, "webScanner");
        return results.searchResults;
    }
}
//# sourceMappingURL=researchWeb.js.map