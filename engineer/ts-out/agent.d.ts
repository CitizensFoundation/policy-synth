import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsEngineerAgentBase } from "./agentBase.js";
export declare class PsEngineerAgent extends PsEngineerAgentBase {
    memory: PsEngineerMemoryData;
    githubIssueUrl?: string;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get maxThinkingTokens(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    private static readonly ENGINEER_AGENT_CLASS_BASE_ID;
    private static readonly ENGINEER_AGENT_CLASS_VERSION;
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number, endProgress: number);
    /**
     * If a GitHub issue URL was provided, fetch the issue and extract the
     * task title, description, and instructions.
     */
    initializeFromGitHubIssue(): Promise<void>;
    /**
     * Fetches a GitHub issue given its URL by converting it to the GitHub API URL.
     */
    fetchGitHubIssue(url: string): Promise<{
        title: string;
        body: string;
    }>;
    /**
     * Converts a GitHub issue URL into its corresponding API URL.
     */
    convertToApiUrl(issueUrl: string): string;
    /**
     * Parses the body of a GitHub issue to extract the task description and instructions.
     */
    parseIssueBody(body: string): {
        taskDescription: string;
        taskInstructions: string;
    } | null;
    /**
     * Removes comments from the given code using the "strip-comments" package.
     */
    removeCommentsFromCode(code: string): string;
    /**
     * Optionally remove the workspace folder prefix from a file path.
     */
    removeWorkspacePathFromFileIfNeeded(filePath: string): string;
    /**
     * Adds the workspace folder prefix to a file path if needed.
     */
    addWorkspacePathToFileIfNeeded(filePath: string): string;
    /**
     * Performs web research using helper agents.
     */
    doWebResearch(): Promise<void>;
    /**
     * Recursively reads all TypeScript file names in a folder.
     */
    readAllTypescriptFileNames(folderPath: string): Promise<string[]>;
    /**
     * Searches for .d.ts files in node_modules by recursively reading directories.
     */
    searchDtsFilesInNodeModules(): Promise<string[]>;
    /**
     * Filters the given list of .d.ts files by calling the LLM.
     */
    filterRelevantDtsFiles(dtsFiles: string[], addMinOneFileInstructions?: boolean): Promise<string[]>;
    /**
     * Loads the content of a file given its path.
     */
    loadFileContents(fileName: string): string | null;
    /**
     * Main processing method.
     * This method initializes the agent (including GitHub issue parsing),
     * scans TypeScript source and declaration files, performs web research if needed,
     * and finally calls the programming agent to implement the task.
     */
    process(): Promise<void>;
    static configurationQuestions: ({
        uniqueId: string;
        type: string;
        value: string;
        maxLength: number;
        required: boolean;
        rows: number;
        charCounter: boolean;
        text: string;
    } | {
        uniqueId: string;
        type: string;
        value: string;
        maxLength: number;
        required: boolean;
        text: string;
        rows?: undefined;
        charCounter?: undefined;
    } | {
        uniqueId: string;
        type: string;
        value: string;
        maxLength: number;
        required: boolean;
        rows: number;
        text: string;
        charCounter?: undefined;
    })[];
    /**
     * Returns configuration questions for the Engineer Agent.
     * Here we include a long text area for the task and a field for the local code path.
     */
    static getConfigurationQuestions(): any[];
    /**
     * Returns the metadata used to register this agent class.
     */
    static getAgentClass(): any;
}
//# sourceMappingURL=agent.d.ts.map