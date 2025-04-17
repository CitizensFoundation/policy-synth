import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobTitleLicenseDegreeAnalysisAgent } from "./licenceAnalysisAgent.js";
export declare class JobTitleLicenseDegreeAnalysisQueue extends PolicySynthAgentQueue {
    memory: JobDescriptionMemoryData;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof JobTitleLicenseDegreeAnalysisAgent;
        weight: number;
    }[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(agentId: number): Promise<void>;
}
//# sourceMappingURL=licenceAnalysisQueue.d.ts.map