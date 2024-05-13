import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PSEngineerAgent extends PolicySynthAgentBase {
    memory: PsEngineerMemoryData;
    constructor();
    doWebResearch(): Promise<void>;
    readAllTypescriptFileNames(folderPath: string): Promise<string[]>;
    searchDtsFilesInNodeModules(): Promise<string[]>;
    run(): Promise<void>;
    loadFileContents(fileName: string): string | null;
}
//# sourceMappingURL=agent.d.ts.map