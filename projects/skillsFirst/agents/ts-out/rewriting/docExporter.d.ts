import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class JobDescriptionPairExporter extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    private docsConnector;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    exportPairs(): Promise<void>;
}
//# sourceMappingURL=docExporter.d.ts.map