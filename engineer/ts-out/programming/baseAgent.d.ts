import { Project } from "ts-morph";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * Extend PolicySynthAgent instead of the older PolicySynthScAgentBase,
 * but keep all your existing functionality and method logic.
 */
export declare abstract class PsEngineerBaseProgrammingAgent extends PolicySynthAgent {
    memory: PsEngineerMemoryData;
    otherFilesToKeepInContextContent: string | undefined | null;
    documentationFilesInContextContent: string | undefined | null;
    currentFileContents: string | undefined | null;
    likelyToChangeFilesContents: string | undefined | null;
    maxRetries: number;
    currentErrors: string | undefined | null;
    previousCurrentErrors: string | undefined | null;
    tsMorphProject: Project | undefined;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    /**
     * Adapted constructor: now uses PolicySynthAgent’s constructor signature.
     */
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress?: number, endProgress?: number, otherFilesToKeepInContextContent?: string | null, documentationFilesInContextContent?: string | null, likelyToChangeFilesContents?: string | null, tsMorphProject?: Project);
    updateMemoryWithFileContents(fileName: string, content: string): void;
    renderCodingRules(): string;
    setOriginalFileIfNeeded(fileName: string, content: string): void;
    getCompletedFileContent(): string | string[];
    setCurrentErrors(errors: string | undefined): void;
    renderCurrentErrorsAndOriginalFiles(): string;
    removeWorkspacePathFromFileIfNeeded(filePath: string): string;
    renderDefaultTaskAndContext(): string;
    renderProjectDescription(): string;
    renderOriginalFiles(): string;
    loadFileContents(fileName: string): string | null;
    getFileContentsWithFileName(fileNames: string[]): string;
    /**
     * Example usage of the new callModel approach if you need to invoke the LLM:
     */
    exampleModelCall(sampleUserInput: string): Promise<string>;
}
//# sourceMappingURL=baseAgent.d.ts.map