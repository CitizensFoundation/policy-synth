import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobDescriptionAnalysisAgent } from "./jobDescriptionAgent.js";
import { SheetsComparisonAgent } from "./evals/compareSheets.js";
export declare class JobDescriptionAnalysisQueue extends PolicySynthAgentQueue {
    memory: JobDescriptionMemoryData;
    get agentQueueName(): string;
    get processors(): ({
        processor: typeof JobDescriptionAnalysisAgent;
        weight: number;
    } | {
        processor: typeof SheetsComparisonAgent;
        weight: number;
    })[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(agentId: number): Promise<void>;
}
//# sourceMappingURL=agentQueue.d.ts.map