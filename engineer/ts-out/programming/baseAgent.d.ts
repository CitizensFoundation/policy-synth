import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { Project } from "ts-morph";
export declare abstract class PsEngineerBaseProgrammingAgent extends PolicySynthAgentBase {
    memory: PsEngineerMemoryData;
    otherFilesToKeepInContextContent: string | undefined | null;
    documentationFilesInContextContent: string | undefined | null;
    currentFileContents: string | undefined | null;
    likelyToChangeFilesContents: string | undefined | null;
    maxRetries: number;
    tsMorphProject: Project | undefined;
    constructor(memory: PsEngineerMemoryData, likelyToChangeFilesContents?: string | null | undefined, otherFilesToKeepInContextContent?: string | null | undefined, documentationFilesInContextContent?: string | null | undefined, tsMorphProject?: Project | undefined);
    updateMemoryWithFileContents(fileName: string, content: string): void;
    setOriginalFileIfNeeded(fileName: string, content: string): void;
    renderDefaultTaskAndContext(): string;
    renderOriginalFiles(): string;
    loadFileContents(fileName: string): string | null;
    getFileContentsWithFileName(fileNames: string[]): string;
}
//# sourceMappingURL=baseAgent.d.ts.map