import { Job } from "bullmq";
import { CreateRootCausesSearchQueriesAgent } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesAgent } from "./web/getRootCausesWebPages.js";
import { SearchWebForRootCausesAgent } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesAgent } from "./ranking/rankRootCausesSearchQueries.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export declare class RootCausesAgent extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    process(): Promise<void>;
    get agentQueueName(): "smarter_crowdsourcing_root_causes";
    get processors(): ({
        processor: typeof CreateRootCausesSearchQueriesAgent;
        weight: number;
    } | {
        processor: typeof RankRootCausesSearchQueriesAgent;
        weight: number;
    } | {
        processor: typeof SearchWebForRootCausesAgent;
        weight: number;
    } | {
        processor: typeof GetRootCausesWebPagesAgent;
        weight: number;
    })[];
}
//# sourceMappingURL=rootCausesAgent.d.ts.map