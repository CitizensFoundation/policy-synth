import { CreateRootCausesSearchQueriesProcessor } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesProcessor } from "./web/getRootCausesWebPages.js";
import { SearchWebForRootCausesProcessor } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesProcessor } from "./ranking/rankRootCausesSearchQueries.js";
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
            { processor: CreateRootCausesSearchQueriesProcessor, weight: 10 },
            { processor: RankRootCausesSearchQueriesProcessor, weight: 10 },
            { processor: SearchWebForRootCausesProcessor, weight: 20 },
            { processor: GetRootCausesWebPagesProcessor, weight: 20 },
        ];
    }
}
//# sourceMappingURL=rootCausesAgent.js.map