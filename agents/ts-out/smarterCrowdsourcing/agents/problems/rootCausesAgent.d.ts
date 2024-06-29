import { Job } from "bullmq";
import { CreateRootCausesSearchQueriesProcessor } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesProcessor } from "./web/getRootCausesWebPages.js";
import { SearchWebForRootCausesProcessor } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesProcessor } from "./ranking/rankRootCausesSearchQueries.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export declare class RootCausesAgent extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    process(): Promise<void>;
    get agentQueueName(): "smarter_crowdsourcing_root_causes";
    get processors(): ({
        processor: typeof CreateRootCausesSearchQueriesProcessor;
        weight: number;
    } | {
        processor: typeof RankRootCausesSearchQueriesProcessor;
        weight: number;
    } | {
        processor: typeof SearchWebForRootCausesProcessor;
        weight: number;
    } | {
        processor: typeof GetRootCausesWebPagesProcessor;
        weight: number;
    })[];
}
//# sourceMappingURL=rootCausesAgent.d.ts.map