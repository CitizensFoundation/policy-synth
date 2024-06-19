import { BaseAgentProcessor } from "../baseAgentProcessor.js";
import { Job } from "bullmq";
export declare class AgentPolicies extends BaseAgentProcessor {
    memory: PsSmarterCrowdsourcingMemoryData;
    initializeMemory(job: Job): Promise<void>;
    setStage(stage: PsScMemoryStageTypes): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=policies.d.ts.map