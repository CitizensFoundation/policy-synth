import axios from "axios";
import fs from "fs";
import path from "path";
import strip from "strip-comments";
// These are your helper agents – assumed to be defined elsewhere
import { PsEngineerInitialAnalyzer } from "./analyze/initialAnalyzer.js";
import { PsEngineerExamplesWebResearchAgent } from "./deepResearch/examplesWebResearch.js";
import { PsEngineerDocsWebResearchAgent } from "./deepResearch/documentationWebResearch.js";
import { PsEngineerProgrammingAgent } from "./programming/programmingAgent.js";
import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
import { PsEngineerAgentBase } from "./agentBase.js";
export class PsEngineerAgent extends PsEngineerAgentBase {
    githubIssueUrl;
    get maxModelTokensOut() {
        return 80000;
    }
    get modelTemperature() {
        return 0.0;
    }
    get reasoningEffort() {
        return "high";
    }
    static ENGINEER_AGENT_CLASS_BASE_ID = "15e7af42-4cf5-1b36-b3cd-f6adc97b63d4";
    static ENGINEER_AGENT_CLASS_VERSION = 2;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.githubIssueUrl = this.getConfig("githubIssueUrl", "");
        // Initialize defaults in memory if they are not already set.
        this.memory.actionLog = this.memory.actionLog || [];
        this.memory.workspaceFolder = this.getConfig("codeLocalPath", "/home/robert/Scratch/policy-synth-engineer-tests/agents");
        this.memory.taskTitle = this.memory.taskTitle || "";
        this.memory.taskDescription = this.memory.taskDescription || "";
        this.memory.taskInstructions = this.getConfig("taskInstructions", "") || "";
        this.memory.docsSitesToScan = this.getConfig("docsSitesToScan", "") || [];
        this.memory.outsideTypedefPath =
            this.getConfig("outsideTypedefPath", "") || "";
    }
    /**
     * If a GitHub issue URL was provided, fetch the issue and extract the
     * task title, description, and instructions.
     */
    async initializeFromGitHubIssue() {
        if (this.githubIssueUrl) {
            const issue = await this.fetchGitHubIssue(this.githubIssueUrl);
            const parsedDescription = this.parseIssueBody(issue.body);
            if (!parsedDescription) {
                throw new Error("Failed to parse Task Description and Task Instructions from the issue body.");
            }
            this.memory.taskTitle = issue.title;
            this.memory.taskDescription = parsedDescription.taskDescription;
            this.memory.taskInstructions = parsedDescription.taskInstructions;
            this.logger.info(`GitHub Issue Title: ${issue.title}`);
            this.logger.info(`GitHub Issue Desc: ${parsedDescription.taskDescription}`);
            this.logger.info(`GitHub Issue Task: ${parsedDescription.taskInstructions}`);
            await this.saveMemory();
        }
    }
    /**
     * Fetches a GitHub issue given its URL by converting it to the GitHub API URL.
     */
    async fetchGitHubIssue(url) {
        try {
            const apiUrl = this.convertToApiUrl(url);
            const response = await axios.get(apiUrl);
            return {
                title: response.data.title,
                body: response.data.body,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch issue: ${error.message}`);
        }
    }
    /**
     * Converts a GitHub issue URL into its corresponding API URL.
     */
    convertToApiUrl(issueUrl) {
        const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
        const match = issueUrl.match(regex);
        if (!match) {
            throw new Error("Invalid GitHub issue URL");
        }
        const [, owner, repo, issueNumber] = match;
        return `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    }
    /**
     * Parses the body of a GitHub issue to extract the task description and instructions.
     */
    parseIssueBody(body) {
        const TASK_DESCRIPTION_TOKEN = "**Task Description**";
        const TASK_INSTRUCTIONS_TOKEN = "**Task Instructions**";
        const descriptionStart = body.indexOf(TASK_DESCRIPTION_TOKEN);
        const instructionsStart = body.indexOf(TASK_INSTRUCTIONS_TOKEN);
        if (descriptionStart === -1 || instructionsStart === -1) {
            return null;
        }
        const taskDescription = body
            .substring(descriptionStart + TASK_DESCRIPTION_TOKEN.length, instructionsStart)
            .trim();
        const taskInstructions = body
            .substring(instructionsStart + TASK_INSTRUCTIONS_TOKEN.length)
            .trim();
        return {
            taskDescription,
            taskInstructions,
        };
    }
    /**
     * Removes comments from the given code using the "strip-comments" package.
     */
    removeCommentsFromCode(code) {
        return strip(code);
    }
    /**
     * Optionally remove the workspace folder prefix from a file path.
     */
    removeWorkspacePathFromFileIfNeeded(filePath) {
        return filePath.replace(this.memory.workspaceFolder, "");
    }
    /**
     * Adds the workspace folder prefix to a file path if needed.
     */
    addWorkspacePathToFileIfNeeded(filePath) {
        return path.join(this.memory.workspaceFolder, filePath);
    }
    /**
     * Performs web research using helper agents.
     */
    async doWebResearch() {
        const exampleResearcher = new PsEngineerExamplesWebResearchAgent(this.agent, this.memory, 0, 100);
        const docsResearcher = new PsEngineerDocsWebResearchAgent(this.agent, this.memory, 0, 100);
        const [/*exampleContextItems,*/ docsContextItems] = await Promise.all([
            // exampleResearcher.doWebResearch() as Promise<string[]>,
            docsResearcher.doWebResearch(),
        ]);
        //this.memory.exampleContextItems = exampleContextItems;
        this.memory.docsContextItems = docsContextItems;
        this.memory.actionLog.push("Web research completed");
        await this.saveMemory();
    }
    /**
     * Recursively reads all TypeScript file names in a folder.
     */
    async readAllTypescriptFileNames(folderPath) {
        const files = fs.readdirSync(folderPath);
        const allFiles = [];
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory() && file !== "ts-out" && file !== "node_modules") {
                const subFiles = await this.readAllTypescriptFileNames(filePath);
                allFiles.push(...subFiles);
            }
            else if (path.extname(file) === ".ts") {
                allFiles.push(filePath);
            }
        }
        return allFiles;
    }
    /**
     * Searches for .d.ts files in node_modules by recursively reading directories.
     */
    async searchDtsFilesInNodeModules() {
        const dtsFiles = [];
        const readDtsFilesRecursively = async (directory) => {
            try {
                const entries = fs.readdirSync(directory, { withFileTypes: true });
                this.logger.info(`Reading directory: ${directory}`);
                for (const entry of entries) {
                    const fullPath = path.join(directory, entry.name);
                    if (entry.isDirectory()) {
                        this.logger.info(`Entering directory: ${fullPath}`);
                        await readDtsFilesRecursively(fullPath);
                    }
                    else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
                        this.logger.info(`Found .d.ts file: ${fullPath}`);
                        dtsFiles.push(fullPath);
                    }
                    else {
                        this.logger.debug(`Skipping: ${fullPath}`);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error reading directory ${directory}: ${error}`);
            }
        };
        const searchPackages = async () => {
            if (this.memory.likelyRelevantNpmPackageDependencies &&
                this.memory.likelyRelevantNpmPackageDependencies.length > 0) {
                this.logger.info(`Searching packages: ${this.memory.likelyRelevantNpmPackageDependencies.join(", ")}`);
                for (const packageName of this.memory
                    .likelyRelevantNpmPackageDependencies) {
                    const packagePath = path.join(this.memory.workspaceFolder, "node_modules", packageName);
                    this.logger.info(`Searching package: ${packagePath}`);
                    await readDtsFilesRecursively(packagePath);
                }
            }
            else {
                this.logger.warn("No npm packages to search for .d.ts files");
            }
        };
        await searchPackages();
        this.logger.info("Filtering relevant .d.ts files", dtsFiles);
        const relevantDtsFiles = await this.filterRelevantDtsFiles(dtsFiles);
        this.logger.info(`Relevant .d.ts files: ${relevantDtsFiles.join(", ")}`);
        return relevantDtsFiles;
    }
    /**
     * Filters the given list of .d.ts files by calling the LLM.
     */
    async filterRelevantDtsFiles(dtsFiles, addMinOneFileInstructions = false) {
        dtsFiles = dtsFiles.map((filePath) => this.removeWorkspacePathFromFileIfNeeded(filePath));
        const getSystemPrompt = (addInstruction) => `<Instructions>
1. You will receive a list of .d.ts file paths from the user to analyze.
2. Always output the d.ts file paths again that are possibly relevant for the upcoming user task.
3. Sometimes the relevant file might be called index.d.ts so look at the whole paths of the files.
${addInstruction
            ? "4. Always output at least one d.ts file, the best ones to help with the task at hand."
            : ""}
</Instructions>

<OutputFormat>
Only output a JSON array with possibly relevant d.ts files, no explanations before or after the JSON string[].
</OutputFormat>

<UpcomingUserTask>
  ${this.memory.taskTitle
            ? `<TaskTitle>${this.memory.taskTitle}</TaskTitle>`
            : ""}
  ${this.memory.taskDescription
            ? `<TaskDescription>${this.memory.taskDescription}</TaskDescription>`
            : ""}
  ${this.memory.taskInstructions
            ? `<TaskInstructions>${this.memory.taskInstructions}</TaskInstructions>`
            : ""}
</UpcomingUserTask>
`;
        const userPrompt = `<ListOfDtsFilesToAnalyzeForRelevanceToTheTask>
${JSON.stringify(dtsFiles, null, 2)}
</ListOfDtsFilesToAnalyzeForRelevanceToTheTask>

Please return a JSON string array of the relevant files:`;
        let relevantFiles = [];
        let retryCount = 0;
        while (retryCount < 5) {
            const systemPrompt = getSystemPrompt(addMinOneFileInstructions);
            try {
                const messages = [
                    this.createSystemMessage(systemPrompt),
                    this.createHumanMessage(userPrompt),
                ];
                this.startTiming();
                relevantFiles = (await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Small, messages, true));
                await this.addTimingResult("FilterRelevantDtsFiles");
                this.logger.info(JSON.stringify(relevantFiles, null, 2));
                relevantFiles = relevantFiles.map((filePath) => this.addWorkspacePathToFileIfNeeded(filePath));
                this.logger.info("Filtered relevant files", relevantFiles);
                if (relevantFiles.length > 0) {
                    return relevantFiles;
                }
            }
            catch (error) {
                this.logger.error("Error parsing LLM response:", error);
            }
            retryCount++;
            if (retryCount > 0) {
                addMinOneFileInstructions = true;
            }
        }
        return relevantFiles;
    }
    /**
     * Loads the content of a file given its path.
     */
    loadFileContents(fileName) {
        try {
            const content = fs.readFileSync(fileName, "utf-8");
            return content;
        }
        catch (error) {
            this.logger.error(`Error reading file ${fileName}: ${error}`);
            return null;
        }
    }
    /**
     * Main processing method.
     * This method initializes the agent (including GitHub issue parsing),
     * scans TypeScript source and declaration files, performs web research if needed,
     * and finally calls the programming agent to implement the task.
     */
    async process() {
        if (this.githubIssueUrl) {
            await this.initializeFromGitHubIssue();
        }
        this.memory.allBuildErrors = [];
        this.memory.allCodingPlans = [];
        this.memory.allTypescriptSrcFiles = [];
        this.memory.existingTypeScriptFilesLikelyToChange = [];
        this.memory.usefulTypescriptDefinitionFilesToKeepInContext = [];
        this.memory.usefulTypescriptCodeFilesToKeepInContext = [];
        this.memory.documentationFilesToKeepInContext = [];
        this.memory.likelyRelevantNpmPackageDependencies = [];
        this.memory.timingResults = [];
        this.memory.rejectedFilesForRelevance = [];
        this.memory.acceptedFilesForRelevance = [];
        await this.saveMemory();
        await this.updateRangedProgress(undefined, "Analyzing code...");
        // Read all TypeScript source file names from the configured workspace.
        this.memory.allTypescriptSrcFiles = await this.readAllTypescriptFileNames(this.memory.workspaceFolder);
        if (this.memory.outsideTypedefPath) {
            let files = await this.readAllTypescriptFileNames(this.memory.outsideTypedefPath);
            // Filter so only include d.ts. files that are in the outsideTypedefPath
            files = files.filter((filePath) => filePath.endsWith(".d.ts"));
            this.memory.allTypescriptSrcFiles = [
                ...this.memory.allTypescriptSrcFiles,
                ...files,
            ];
        }
        this.logger.debug(`All typescript files for typedefs: ${JSON.stringify(this.memory.allTypescriptSrcFiles, null, 2)}`);
        // Assemble all .d.ts files from the source files.
        this.memory.allTypeDefsContents = this.memory.allTypescriptSrcFiles
            .map((filePath) => {
            if (filePath.endsWith(".d.ts")) {
                const content = this.removeCommentsFromCode(this.loadFileContents(filePath) || "");
                if (content && content.length > 75) {
                    return `\n${this.removeWorkspacePathFromFileIfNeeded(filePath)}:\n${content}`;
                }
                else {
                    return null;
                }
            }
            return null;
        })
            .filter(Boolean)
            .join("\n");
        this.memory.allTypeDefsContents = `<AllProjectTypescriptDefs>\n${this.memory.allTypeDefsContents}\n</AllProjectTypescriptDefs>`;
        const analyzeAgent = new PsEngineerInitialAnalyzer(this.agent, this.memory, 0, 100);
        await analyzeAgent.analyzeAndSetup();
        await this.updateRangedProgress(undefined, "Analyzing code completed");
        // If there are any likely-relevant npm package dependencies, search for .d.ts files.
        if (this.memory.likelyRelevantNpmPackageDependencies &&
            this.memory.likelyRelevantNpmPackageDependencies.length > 0) {
            await this.updateRangedProgress(undefined, "Searching for .d.ts files in node_modules...");
            let nodeModuleTypeDefs = await this.searchDtsFilesInNodeModules();
            this.memory.allTypescriptSrcFiles = [
                ...this.memory.allTypescriptSrcFiles,
                ...nodeModuleTypeDefs,
            ];
            this.logger.debug(`nodeModuleTypeDefs: ${nodeModuleTypeDefs.length} before`);
            const nodeModuleTypeDefsAnalysis = await analyzeAgent.analyzeFilesForRelevanceAndReasons(nodeModuleTypeDefs, this.memory.taskInstructions, "potentially relevant node_modules .d.ts files");
            this.logger.debug(`nodeModuleTypeDefs: ${nodeModuleTypeDefs.length} after`);
            this.memory.usefulTypescriptDefinitionFilesToKeepInContext = [
                ...this.memory.usefulTypescriptDefinitionFilesToKeepInContext,
                ...nodeModuleTypeDefsAnalysis,
            ];
            if (nodeModuleTypeDefs.length > 0) {
                this.memory.allTypeDefsContents += `<AllRelevantNodeModuleTypescriptDefs>\n${nodeModuleTypeDefs
                    .map((filePath) => {
                    const content = this.removeCommentsFromCode(this.loadFileContents(filePath) || "");
                    if (content && content.length > 75) {
                        return `\n${this.removeWorkspacePathFromFileIfNeeded(filePath)}:\n${content}`;
                    }
                    else {
                        return null;
                    }
                })
                    .filter(Boolean)
                    .join("\n")}\n</AllRelevantNodeModuleTypescriptDefs>`;
            }
            else {
                this.logger.warn("No .d.ts files found in node_modules");
            }
        }
        else {
            this.logger.warn("No npm packages to search for .d.ts files");
        }
        await this.saveMemory();
        //this.logger.info(`All TYPEDEFS: ${this.memory.allTypeDefsContents}`);
        if (this.memory.needsDocumentationAndExamples === true) {
            await this.updateRangedProgress(undefined, "Doing web research...");
            await this.doWebResearch();
        }
        await this.saveMemory();
        // Finally, call the programming agent to implement the task.
        const programmer = new PsEngineerProgrammingAgent(this.agent, this.memory, 0, 100, {});
        this.logger.info(`Starting to implement task`);
        await programmer.implementTask();
        await this.setCompleted("Task Completed");
        await this.saveMemory();
    }
    static configurationQuestions = [
        {
            uniqueId: "taskInstructions",
            type: "textAreaLong",
            value: "",
            maxLength: 75000,
            required: false,
            rows: 7,
            charCounter: true,
            text: "Task description for the Engineer Agent",
        },
        {
            uniqueId: "codeLocalPath",
            type: "textField",
            value: "/home/robert/Scratch/policy-synth-engineer-tests/agents",
            maxLength: 512,
            required: true,
            text: "Local path to the code that should be worked on",
        },
        {
            uniqueId: "outsideTypedefPath",
            type: "textField",
            value: "",
            maxLength: 512,
            required: false,
            text: "Outside TypeScript file path (optional)",
        },
        {
            uniqueId: "githubIssueUrl",
            type: "textField",
            value: "",
            maxLength: 512,
            required: false,
            text: "GitHub issue URL (optional)",
        },
        {
            uniqueId: "docsSitesToScan",
            type: "textAreaLong",
            value: "",
            maxLength: 5000,
            required: false,
            rows: 3,
            text: "Documentation sites to scan",
        },
    ];
    /**
     * Returns configuration questions for the Engineer Agent.
     * Here we include a long text area for the task and a field for the local code path.
     */
    static getConfigurationQuestions() {
        return this.configurationQuestions;
    }
    /**
     * Returns the metadata used to register this agent class.
     */
    static getAgentClass() {
        return {
            class_base_id: PsEngineerAgent.ENGINEER_AGENT_CLASS_BASE_ID,
            user_id: 0,
            name: "Engineer Agent",
            version: PsEngineerAgent.ENGINEER_AGENT_CLASS_VERSION,
            available: true,
            configuration: {
                category: "Engineering",
                subCategory: "codeAnalysis",
                hasPublicAccess: false,
                description: "An agent for analyzing and improving code based on a given task",
                queueName: "ENGINEER_AGENT_QUEUE",
                imageUrl: "https://aoi-storage-production.citizens.is/dl/d3693387415227931c57bfb63fa2e1ed--retina-1.png",
                iconName: "engineering",
                capabilities: ["analysis", "web research", "programming"],
                requestedAiModelSizes: [
                    PsAiModelSize.Small,
                    PsAiModelSize.Medium,
                    PsAiModelSize.Large,
                ],
                defaultStructuredQuestions: this.configurationQuestions,
                questions: PsEngineerAgent.getConfigurationQuestions(),
                supportedConnectors: [],
            },
        };
    }
}
//# sourceMappingURL=agent.js.map