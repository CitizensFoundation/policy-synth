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
    /**
     * Reads the contents of each .md file in memory.documentationFilesToKeepInContext
     * and checks if they are relevant to the user’s coding task.
     *
     * The LLM is asked to:
     *  - Summarize each document.
     *  - Assess whether it is relevant or not relevant to the task.
     *
     * The method then updates `memory` with a new property like
     * `relevantDocumentationSummaries` which can be used in subsequent steps.
     */
    analyzeDocumentationRelevance(): Promise<void>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map