import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
interface GitHubIssue {
    title: string;
    body: string;
}
export declare class PSEngineerAgent extends PolicySynthScAgentBase {
    memory: PsEngineerMemoryData;
    githubIssueUrl: string | undefined;
    constructor(githubIssueUrl?: string | undefined);
    initializeFromGitHubIssue(): Promise<void>;
    fetchGitHubIssue(url: string): Promise<GitHubIssue>;
    convertToApiUrl(issueUrl: string): string;
    parseIssueBody(body: string): {
        taskDescription: string;
        taskInstructions: string;
    } | null;
    removeCommentsFromCode(code: string): string;
    removeWorkspacePathFromFileIfNeeded(filePath: string): string;
    addWorkspacePathToFileIfNeeded(filePath: string): string;
    doWebResearch(): Promise<void>;
    readAllTypescriptFileNames(folderPath: string): Promise<string[]>;
    searchDtsFilesInNodeModules(): Promise<string[]>;
    filterRelevantDtsFiles(dtsFiles: string[], addMinOneFileInstructions?: boolean): Promise<string[]>;
    run(): Promise<void>;
    loadFileContents(fileName: string): string | null;
}
export {};
//# sourceMappingURL=agent.d.ts.map