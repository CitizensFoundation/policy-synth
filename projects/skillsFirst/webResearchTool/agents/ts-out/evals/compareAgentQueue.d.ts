import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { SheetsComparisonAgent } from "./compareSheets.js";
export declare class JobDescriptionCompareSheetsQueue extends PolicySynthAgentQueue {
    memory: JobDescriptionMemoryData;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof SheetsComparisonAgent;
        weight: number;
    }[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(agentId: number): Promise<void>;
}
//# sourceMappingURL=compareAgentQueue.d.ts.map