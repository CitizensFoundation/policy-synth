import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes";
import { PolicySynthAgent } from "@policysynth/agents/base/agent";
import { PsAgent } from "@policysynth/agents/dbModels/agent";
export declare class DetermineProfessionalLicenseRequirementAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    modelType: PsAiModelType;
    static allLicenceTypes: string[];
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    processJobDescription(jobDescription: JobDescription): Promise<void>;
    processLicenseTypes(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=additionalRequirements.d.ts.map