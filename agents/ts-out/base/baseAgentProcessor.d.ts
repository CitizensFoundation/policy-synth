import { Job } from "bullmq";
import { PolicySynthScAgentBase } from "./baseScAgentBase.js";
export declare abstract class BaseAgentProcessor extends PolicySynthScAgentBase {
    job: Job;
    getRedisKey(groupId: number): string;
    initializeMemory(job: Job): Promise<void>;
    abstract process(): Promise<void>;
    setup(job: Job): Promise<void>;
    saveMemory(): Promise<void>;
}
//# sourceMappingURL=baseAgentProcessor.d.ts.map