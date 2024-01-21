import { BaseAgent } from "../baseAgent.js";
import { Job } from "bullmq";
export declare class AgentPolicies extends BaseAgent {
    memory: IEngineInnovationMemoryData;
    initializeMemory(job: Job): Promise<void>;
    setStage(stage: IEngineStageTypes): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=policies.d.ts.map