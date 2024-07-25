import { BingSearchApi } from "./bingSearchApi.js";
import { GoogleSearchApi } from "./googleSearchApi.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";
export class BaseSearchWebAgent extends PolicySynthAgentBase {
    seenUrls;
    async callSearchApi(query) {
        if (process.env.GOOGLE_SEARCH_API_KEY &&
            process.env.GOOGLE_SEARCH_API_CX_ID) {
            const googleSearchApi = new GoogleSearchApi();
            return await googleSearchApi.search(query);
        }
        else if (process.env.AZURE_BING_SEARCH_KEY) {
            const bingSearchApi = new BingSearchApi();
            return await bingSearchApi.search(query);
        }
        else {
            this.logger.error("Missing search API key");
            throw new Error("Missing search API key");
        }
    }
    async getQueryResults(queriesToSearch, id) {
        let searchResults = [];
        for (let q = 0; q < queriesToSearch.length; q++) {
            const generalSearchData = await this.callSearchApi(queriesToSearch[q]);
            this.logger.debug(`Got Search Data 1: ${JSON.stringify(generalSearchData, null, 2)}`);
            if (generalSearchData) {
                searchResults = [...searchResults, ...generalSearchData];
            }
            else {
                this.logger.error("No search results");
            }
            this.logger.debug("Got Search Results 2");
            this.logger.debug(`Search Results Batch: ${JSON.stringify(searchResults, null, 2)}`);
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        if (!this.seenUrls.has(id)) {
            this.seenUrls.set(id, new Set());
        }
        const seen = this.seenUrls.get(id);
        this.logger.debug(`Before dedup length ${searchResults.length}`);
        searchResults = searchResults.filter((v, i, a) => {
            const urlSeen = seen.has(v.url);
            if (!urlSeen) {
                seen.add(v.url);
            }
            return !urlSeen;
        });
        this.logger.debug(`After dedup length ${searchResults.length}`);
        return { searchResults };
    }
}
//# sourceMappingURL=searchWeb.js.map