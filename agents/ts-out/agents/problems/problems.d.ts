import { BaseAgent } from "../baseAgent.js";
import { Job } from "bullmq";
export declare class AgentProblems extends BaseAgent {
    memory: IEngineInnovationMemoryData;
    initializeMemory(job: Job): Promise<void>;
    setStage(stage: IEngineStageTypes): Promise<void>;
    processSubProblems(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=problems.d.ts.map