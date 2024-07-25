import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { Project } from "ts-morph";
export declare abstract class PsEngineerBaseProgrammingAgent extends PolicySynthScAgentBase {
    memory: PsEngineerMemoryData;
    otherFilesToKeepInContextContent: string | undefined | null;
    documentationFilesInContextContent: string | undefined | null;
    currentFileContents: string | undefined | null;
    likelyToChangeFilesContents: string | undefined | null;
    maxRetries: number;
    currentErrors: string | undefined | null;
    previousCurrentErrors: string | undefined | null;
    tsMorphProject: Project | undefined;
    constructor(memory: PsEngineerMemoryData, likelyToChangeFilesContents?: string | null | undefined, otherFilesToKeepInContextContent?: string | null | undefined, documentationFilesInContextContent?: string | null | undefined, tsMorphProject?: Project | undefined);
    updateMemoryWithFileContents(fileName: string, content: string): void;
    renderCodingRules(): string;
    setOriginalFileIfNeeded(fileName: string, content: string): void;
    getCompletedFileContent(): string[] | undefined;
    setCurrentErrors(errors: string | undefined): void;
    renderCurrentErrorsAndOriginalFiles(): string;
    removeWorkspacePathFromFileIfNeeded(filePath: string): string;
    renderDefaultTaskAndContext(): string;
    renderProjectDescription(): string;
    renderOriginalFiles(): string;
    loadFileContents(fileName: string): string | null;
    getFileContentsWithFileName(fileNames: string[]): string;
}
//# sourceMappingURL=baseAgent.d.ts.map