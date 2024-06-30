import { SearchWebAgent } from "../../solutions/web/searchWeb.js";
import { CreateRootCausesSearchQueriesAgent } from "../create/createRootCauseSearchQueries.js";
const FORCE_RESEARCH = true;
export class SearchWebForRootCausesAgent extends SearchWebAgent {
    searchCounter = 0;
    async searchWeb() {
        const problemStatement = this.memory.problemStatement;
        this.updateProgress(undefined, "Searching Web for Root Causes");
        if (!problemStatement.rootCauseSearchResults) {
            //@ts-ignore
            problemStatement.rootCauseSearchResults = {};
        }
        for (const searchResultType of CreateRootCausesSearchQueriesAgent.rootCauseWebPageTypesArray) {
            // If searchCounter mod 10 then print
            if (this.searchCounter % 10 == 0) {
                this.logger.info(`Have searched ${this.searchCounter} queries`);
            }
            if (this.searchCounter > 990) {
                // Sleep for 15 minutes
                this.logger.info(`Sleeping for 15 minutes to avoid search API rate limit`);
                await new Promise((resolve) => setTimeout(resolve, 15 * 60 * 1000));
                this.searchCounter = 300;
            }
            if (FORCE_RESEARCH || !problemStatement.rootCauseSearchResults[searchResultType]) {
                let queriesToSearch = problemStatement.rootCauseSearchQueries[searchResultType].slice(0, this.maxTopRootCauseQueriesToSearchPerType);
                this.logger.debug(`Searching for root cause type ${searchResultType} with queries ${JSON.stringify(queriesToSearch, null, 2)}`);
                const results = await this.getQueryResults(queriesToSearch, `rootCause_${searchResultType}`);
                this.searchCounter += this.maxTopEvidenceQueriesToSearchPerType;
                problemStatement.rootCauseSearchResults[searchResultType] = results.searchResults;
                this.logger.info(`Have saved search results root cause type ${searchResultType}`);
                await this.saveMemory();
            }
            else {
                this.logger.info(`Have already saved search results for root cause type ${searchResultType}`);
            }
        }
    }
    async process() {
        this.logger.info("Search Web for Root Causes Agent");
        this.seenUrls = new Map();
        super.process();
        this.logger.info("Searching web for root causes");
        await this.searchWeb();
        this.logger.info("Finished creating root causes search results");
    }
}
//# sourceMappingURL=searchWebForRootCauses.js.map