import { Job } from "bullmq";
import { PolicySynthSimpleAgentBase } from "./simpleAgent.js";
export declare abstract class BaseAgentProcessor extends PolicySynthSimpleAgentBase {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    constructor();
    abstract process(): Promise<void>;
    setup(job: Job): Promise<void>;
    saveMemory(): Promise<void>;
    updateProgress(progress: number): Promise<void>;
    addStatusMessage(message: string): Promise<void>;
}
//# sourceMappingURL=agentProcessor.d.ts.map