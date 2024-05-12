import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { Project } from "ts-morph";
export declare abstract class PsEngineerBaseProgrammingAgent extends PolicySynthAgentBase {
    memory: PsEngineerMemoryData;
    otherFilesToKeepInContextContent?: string;
    documentationFilesInContextContent?: string;
    currentFileContents: string | undefined | null;
    otherLikelyToChangeFilesContents: string | undefined | null;
    maxRetries: number;
    tsMorphProject: Project | undefined;
    constructor(memory: PsEngineerMemoryData);
    loadFileContents(fileName: string): string | null;
}
//# sourceMappingURL=baseAgent.d.ts.map