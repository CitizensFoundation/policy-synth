import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class ReadingLevelUSGradeAnalysisAgentP2 extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    cleanJobDescriptionText(rawText: string): string;
    callLLM(prompt: string, maxRetries?: number): Promise<any>;
    processJobDescription(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=readingLevelUSGradeAnalysis2P.d.ts.map