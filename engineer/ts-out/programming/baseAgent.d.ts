import { Project } from "ts-morph";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsEngineerAgentBase } from "../agentBase.js";
/**
 * Extend PolicySynthAgent instead of the older PolicySynthScAgentBase,
 * but keep all your existing functionality and method logic.
 */
export declare abstract class PsEngineerBaseProgrammingAgent extends PsEngineerAgentBase {
    memory: PsEngineerMemoryData;
    documentationFilesInContextContent: string | undefined | null;
    currentFileContents: string | undefined | null;
    likelyToChangeFilesContents: string | undefined | null;
    typeDefFilesToKeepInContextContent: string | undefined | null;
    codeFilesToKeepInContextContent: string | undefined | null;
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
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number | undefined, endProgress: number | undefined, { typeDefFilesToKeepInContextContent, codeFilesToKeepInContextContent, documentationFilesInContextContent, likelyToChangeFilesContents, tsMorphProject, }: {
        typeDefFilesToKeepInContextContent?: string | null;
        codeFilesToKeepInContextContent?: string | null;
        documentationFilesInContextContent?: string | null;
        likelyToChangeFilesContents?: string | null;
        tsMorphProject?: Project;
    });
    updateMemoryWithFileContents(fileName: string, content: string): void;
    renderCodingRules(): string;
    setOriginalFileIfNeeded(fileName: string, content: string): void;
    getCompletedFileContent(): string | string[];
    setCurrentErrors(errors: string | undefined): void;
    renderCurrentErrorsAndOriginalFiles(): string;
    removeWorkspacePathFromFileIfNeeded(filePath: string): string;
    renderDefaultTaskAndContext(limited?: boolean): string;
    renderProjectDescription(): string;
    renderOriginalFiles(): string;
    loadFileContents(fileName: string): string | null;
    getFileContentsWithFileName(fileNames: string[], xmlTagName: string): string;
}
//# sourceMappingURL=baseAgent.d.ts.map