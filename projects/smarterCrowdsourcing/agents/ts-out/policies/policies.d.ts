import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { SearchWebForEvidenceAgent } from "./web/searchWebForEvidence.js";
import { GetMetaDataForTopWebEvidenceAgent } from "./web/getMetaDataForTopWebEvidence.js";
import { CreateEvidenceSearchQueriesAgent } from "./create/createEvidenceSearchQueries.js";
export declare class PoliciesAgentQueue extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_policies";
    setupMemoryIfNeeded(): Promise<void>;
    process(): Promise<void>;
    get processors(): ({
        processor: typeof CreateEvidenceSearchQueriesAgent;
        weight: number;
    } | {
        processor: typeof SearchWebForEvidenceAgent;
        weight: number;
    } | {
        processor: typeof GetMetaDataForTopWebEvidenceAgent;
        weight: number;
    })[];
}
//# sourceMappingURL=policies.d.ts.map