import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { ParticipationDataAnalysisAgent } from "./participationAgent.js";
export declare class ParticipationDataAnalysisQueue extends PolicySynthAgentQueue {
    memory: ParticipationDataAnalysisMemory;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof ParticipationDataAnalysisAgent;
        weight: number;
    }[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(agentId: number): Promise<void>;
}
//# sourceMappingURL=participationAgentQueue.d.ts.map