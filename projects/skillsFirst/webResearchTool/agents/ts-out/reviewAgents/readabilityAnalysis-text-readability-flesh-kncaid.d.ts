import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class ReadabilityScoreJobDescriptionAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    processJobDescription(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=readabilityAnalysis-text-readability-flesh-kncaid.d.ts.map