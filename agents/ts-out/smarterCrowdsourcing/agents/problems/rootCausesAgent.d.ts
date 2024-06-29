import { CreateRootCausesSearchQueriesAgent } from "./create/createRootCauseSearchQueries.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export declare class RootCausesAgentQueue extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    process(): Promise<void>;
    get agentQueueName(): "smarter_crowdsourcing_root_causes";
    setupMemoryIfNeeded(): Promise<void>;
    get processors(): {
        processor: typeof CreateRootCausesSearchQueriesAgent;
        weight: number;
    }[];
}
//# sourceMappingURL=rootCausesAgent.d.ts.map