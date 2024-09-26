import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class IdentifyBarriersAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    processJobDescription(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=identifyBarriers.d.ts.map