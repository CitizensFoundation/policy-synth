import { BaseAgentProcessor } from "../baseAgentProcessor.js";
import { Job } from "bullmq";
export declare class AgentProblems extends BaseAgentProcessor {
    memory: PsBaseMemoryData;
    initializeMemory(job: Job): Promise<void>;
    setStage(stage: PsMemoryStageTypes): Promise<void>;
    processSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=problems.d.ts.map