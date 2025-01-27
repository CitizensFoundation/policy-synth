import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class ValidateJobDescriptionAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    /**
     * Processing function for validating job descriptions.
     *
     * This function populates `jobDescription.degreeAnalysis.validationChecks`
     * with pass/fail/n/a for each check.
     */
    processJobDescription(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=dataConsistency.d.ts.map