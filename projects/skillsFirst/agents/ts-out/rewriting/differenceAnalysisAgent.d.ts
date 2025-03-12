import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { EducationType } from "../educationTypes.js";
export declare class DifferenceAnalysisAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    modelType: PsAiModelType;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    detectEducationTypeFromText(text: string): EducationType | null;
    processJobDescription(jobDescription: JobDescription): Promise<boolean>;
}
//# sourceMappingURL=differenceAnalysisAgent.d.ts.map