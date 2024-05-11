import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsEngineerInitialAnalyzer extends PolicySynthAgentBase {
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData);
    readDependencies(): any;
    get analyzeSystemPrompt(): string;
    analyzeUserPrompt(allNpmPackageDependencies: string[]): string;
    analyzeAndSetup(): Promise<void>;
    searchForContext(): Promise<PsEngineerContextItem[]>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map