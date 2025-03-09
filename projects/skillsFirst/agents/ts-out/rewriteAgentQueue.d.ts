import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobDescriptionRewriterAgent } from "./rewriterAgent.js";
export declare class JobDescriptionRewriterQueue extends PolicySynthAgentQueue {
    memory: JobDescriptionMemoryData;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof JobDescriptionRewriterAgent;
        weight: number;
    }[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(agentId: number): Promise<void>;
}
//# sourceMappingURL=rewriteAgentQueue.d.ts.map