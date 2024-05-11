import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsEngineerInitialAnalyzer extends PolicySynthAgentBase {
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData);
    readNpmDependencies(): any;
    get analyzeSystemPrompt(): string;
    analyzeUserPrompt(allNpmPackageDependencies: string[], allDocumentationFiles: string[]): string;
    analyzeAndSetup(): Promise<void>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map