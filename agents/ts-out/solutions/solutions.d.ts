import { BaseAgentProcessor } from "../baseAgentProcessor.js";
import { Job } from "bullmq";
export declare class AgentSolutions extends BaseAgentProcessor {
    memory: PsBaseMemoryData;
    initializeMemory(job: Job): Promise<void>;
    setStage(stage: PsMemoryStageTypes): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=solutions.d.ts.map