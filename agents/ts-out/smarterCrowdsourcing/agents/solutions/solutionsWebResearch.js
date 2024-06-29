import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { CreateSearchQueriesAgent } from "./create/createSearchQueries.js";
import { RankSearchQueriesAgent } from "./ranking/rankSearchQueries.js";
import { SearchWebAgent } from "./web/searchWeb.js";
import { RankSearchResultsAgent } from "./ranking/rankSearchResults.js";
import { GetWebPagesAgent } from "./web/getWebPages.js";
import { CreateSolutionsAgent } from "./create/createSolutions.js";
import { CreateProsConsAgent } from "./create/createProsCons.js";
import { RankWebSolutionsAgent } from "./ranking/rankWebSolutions.js";
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
            { processor: CreateSearchQueriesAgent, weight: 10 },
            { processor: RankSearchQueriesAgent, weight: 10 },
            { processor: SearchWebAgent, weight: 15 },
            { processor: RankSearchResultsAgent, weight: 10 },
            { processor: GetWebPagesAgent, weight: 15 },
            { processor: CreateSolutionsAgent, weight: 15 },
            { processor: CreateProsConsAgent, weight: 10 },
            { processor: RemoveDuplicateWebSolutions, weight: 5 },
            { processor: RankWebSolutionsAgent, weight: 10 },
        ];
    }
}
//# sourceMappingURL=solutionsWebResearch.js.map