import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes";
import { PolicySynthAgent } from "@policysynth/agents/base/agent";
import { PsAgent } from "@policysynth/agents/dbModels/agent";
export declare class ReadingLevelAnalysisAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    modelType: PsAiModelType;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    cleanJobDescriptionText(rawText: string): string;
    callLLM(prompt: string, maxRetries?: number): Promise<any>;
    processJobDescription(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=readingLevelAnalysis.d.ts.map