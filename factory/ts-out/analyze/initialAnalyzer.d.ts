import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsAgentFactoryInitialAnalyzer extends PolicySynthScAgentBase {
    memory: PsAgentFactoryMemoryData;
    constructor(memory: PsAgentFactoryMemoryData);
    readNpmDependencies(): any;
    get analyzeSystemPrompt(): string;
    analyzeUserPrompt(allNpmPackageDependencies: string[], allDocumentationFiles: string[]): string;
    analyzeAndSetup(): Promise<void>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map