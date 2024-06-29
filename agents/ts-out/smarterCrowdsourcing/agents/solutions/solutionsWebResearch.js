import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { CreateSearchQueriesProcessor } from "./create/createSearchQueries.js";
import { RankSearchQueriesProcessor } from "./ranking/rankSearchQueries.js";
import { SearchWebProcessor } from "./web/searchWeb.js";
import { RankSearchResultsProcessor } from "./ranking/rankSearchResults.js";
import { GetWebPagesProcessor } from "./web/getWebPages.js";
import { CreateSolutionsProcessor } from "./create/createSolutions.js";
import { CreateProsConsProcessor } from "./create/createProsCons.js";
import { RankWebSolutionsProcessor } from "./ranking/rankWebSolutions.js";
import { RemoveDuplicateWebSolutions } from "./create/dedupWebSolutions.js";
export class SolutionsWebResearchAgent extends PolicySynthAgentQueue {
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_SOLUTIONS_WEB_RESEARCH;
    }
    async process() {
        await this.processAllAgents();
    }
    get processors() {
        return [
            { processor: CreateSearchQueriesProcessor, weight: 10 },
            { processor: RankSearchQueriesProcessor, weight: 10 },
            { processor: SearchWebProcessor, weight: 15 },
            { processor: RankSearchResultsProcessor, weight: 10 },
            { processor: GetWebPagesProcessor, weight: 15 },
            { processor: CreateSolutionsProcessor, weight: 15 },
            { processor: CreateProsConsProcessor, weight: 10 },
            { processor: RemoveDuplicateWebSolutions, weight: 5 },
            { processor: RankWebSolutionsProcessor, weight: 10 },
        ];
    }
}
//# sourceMappingURL=solutionsWebResearch.js.map