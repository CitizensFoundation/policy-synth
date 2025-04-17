import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
export declare class DegreeRequirementAnalyzerAgent extends PolicySynthAgent {
    memory: LicenseDegreeAnalysisMemoryData;
    modelSize: PsAiModelSize;
    modelType: PsAiModelType;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: LicenseDegreeAnalysisMemoryData, startProgress: number, endProgress: number);
    analyze(extractedText: string, licenseType: string, sourceUrl: string): Promise<LicenseDegreeAnalysisResult | {
        error: string;
    }>;
    process(): Promise<void>;
}
//# sourceMappingURL=requirementAnalyzer.d.ts.map