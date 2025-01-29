import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class DetermineCollegeDegreeStatusAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    modelType: PsAiModelType;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    processCounter: number;
    totalProcesses: number;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number, processCounter: number, totalProcesses: number);
    processJobDescription(jobDescription: JobDescription): Promise<void>;
    private renderEducationTypes;
}
//# sourceMappingURL=determineStatus.d.ts.map