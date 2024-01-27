import { BaseAgentProcessor } from "../baseAgentProcessor.js";
import { Job } from "bullmq";
export declare class AgentPolicies extends BaseAgentProcessor {
    memory: IEngineInnovationMemoryData;
    initializeMemory(job: Job): Promise<void>;
    setStage(stage: IEngineStageTypes): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=policies.d.ts.map