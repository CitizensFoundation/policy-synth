import { BaseAgentProcessor } from "../../../base/agentProcessor.js";
import { Job } from "bullmq";
export declare class AgentPolicies extends BaseAgentProcessor {
    memory: PsSmarterCrowdsourcingMemoryData;
    initializeMemory(job: Job): Promise<void>;
    setStage(stage: string): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=policies.d.ts.map