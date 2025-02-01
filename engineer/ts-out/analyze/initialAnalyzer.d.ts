import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent";
export declare class PsEngineerInitialAnalyzer extends PolicySynthAgent {
    memory: PsEngineerMemoryData;
    /**
     * Adapted constructor:
     *   - If you don’t need a PsAgent object, you can pass a dummy object or adjust
     *     your base class constructor so it only needs memory.
     */
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number, endProgress: number);
    readNpmDependencies(): any;
    get analyzeSystemPrompt(): string;
    analyzeUserPrompt(allNpmPackageDependencies: string[], allDocumentationFiles: string[]): string;
    analyzeAndSetup(): Promise<void>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map