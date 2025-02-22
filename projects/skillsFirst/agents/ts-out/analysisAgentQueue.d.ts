import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobDescriptionAnalysisAgent } from "./analysisAgent.js";
export declare class JobDescriptionAnalysisQueue extends PolicySynthAgentQueue {
    memory: JobDescriptionMemoryData;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof JobDescriptionAnalysisAgent;
        weight: number;
    }[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(agentId: number): Promise<void>;
}
//# sourceMappingURL=analysisAgentQueue.d.ts.map