import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PSEngineerAgent extends PolicySynthAgentBase {
    memory: PsEngineerMemoryData;
    constructor();
    removeCommentsFromCode(code: string): string;
    removeWorkspacePathFromFileIfNeeded(filePath: string): string;
    doWebResearch(): Promise<void>;
    readAllTypescriptFileNames(folderPath: string): Promise<string[]>;
    searchDtsFilesInNodeModules(): Promise<string[]>;
    run(): Promise<void>;
    loadFileContents(fileName: string): string | null;
}
//# sourceMappingURL=agent.d.ts.map