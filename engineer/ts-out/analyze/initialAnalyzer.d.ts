import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent";
export declare class PsEngineerInitialAnalyzer extends PolicySynthAgent {
    memory: PsEngineerMemoryData;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number, endProgress: number);
    readNpmDependencies(): any;
    get analyzeSystemPrompt(): string;
    analyzeUserPrompt(allNpmPackageDependencies: string[], allDocumentationFiles: string[]): string;
    getFilesContents(filePaths: string[]): string;
    analyzeAndSetup(): Promise<void>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map