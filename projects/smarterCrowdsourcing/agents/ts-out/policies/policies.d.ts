import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { PoliciesSheetsExportAgent } from "./export/evidenceSheets.js";
export declare class PoliciesAgentQueue extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_policies";
    setupMemoryIfNeeded(): Promise<void>;
    process(): Promise<void>;
    get processors(): {
        processor: typeof PoliciesSheetsExportAgent;
        weight: number;
    }[];
}
//# sourceMappingURL=policies.d.ts.map