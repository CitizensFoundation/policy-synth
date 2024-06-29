import { CreateRootCausesSearchQueriesAgent } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesAgent } from "./web/getRootCausesWebPages.js";
import { SearchWebForRootCausesAgent } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesAgent } from "./ranking/rankRootCausesSearchQueries.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export class RootCausesAgent extends PolicySynthAgentQueue {
    job;
    async process() {
        await this.processAllAgents();
        ;
    }
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_ROOT_CAUSES;
    }
    get processors() {
        return [
            { processor: CreateRootCausesSearchQueriesAgent, weight: 10 },
            { processor: RankRootCausesSearchQueriesAgent, weight: 10 },
            { processor: SearchWebForRootCausesAgent, weight: 20 },
            { processor: GetRootCausesWebPagesAgent, weight: 20 },
        ];
    }
}
//# sourceMappingURL=rootCausesAgent.js.map