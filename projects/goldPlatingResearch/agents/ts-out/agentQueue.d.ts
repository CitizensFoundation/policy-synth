import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { GoldPlatingResearchAgent } from "./goldPlatingResearchAgent.js";
export declare class GoldPlatingResearchQueue extends PolicySynthAgentQueue {
    memory: GoldPlatingMemoryData;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof GoldPlatingResearchAgent;
        weight: number;
    }[];
    getTestResearchItem(): GoldplatingResearchItem;
    getTestResearchItemThree(): GoldplatingResearchItem;
    getTestResearchItemTwo(): GoldplatingResearchItem;
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(): Promise<void>;
}
//# sourceMappingURL=agentQueue.d.ts.map