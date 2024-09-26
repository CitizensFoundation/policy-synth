import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobDescriptionAnalysisAgent } from "./jobDescriptionAgent.js";
export declare class JobDescriptionAnalysisQueue extends PolicySynthAgentQueue {
    memory: JobDescriptionMemoryData;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof JobDescriptionAnalysisAgent;
        weight: number;
    }[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(): Promise<void>;
}
//# sourceMappingURL=agentQueue.d.ts.map