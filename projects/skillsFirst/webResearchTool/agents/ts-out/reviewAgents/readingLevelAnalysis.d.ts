import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class ReadingLevelAnalysisAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    modelType: PsAiModelType;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    cleanJobDescriptionText(rawText: string): string;
    callLLM(prompt: string, maxRetries?: number): Promise<any>;
    processJobDescription(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=readingLevelAnalysis.d.ts.map