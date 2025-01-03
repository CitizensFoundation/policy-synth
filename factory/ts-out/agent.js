import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsAgentFactoryInitialAnalyzer } from "./analyze/initialAnalyzer.js";
import { PsAgentFactoryExamplesWebResearchAgent } from "./webResearch/examplesWebResearch.js";
import { PsAgentFactoryDocsWebResearchAgent } from "./webResearch/documentationWebResearch.js";
import { PsAgentFactoryProgrammingAgent } from "./programming/programmingAgent.js";
import fs from "fs";
import path from "path";
import strip from "strip-comments";
import { PsConstants } from "@policysynth/agents/constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import axios from "axios";
export class PsAgentFactory extends PolicySynthScAgentBase {
    memory;
    githubIssueUrl;
    constructor(githubIssueUrl = undefined) {
        super();
        this.githubIssueUrl = githubIssueUrl;
        this.memory = {
            actionLog: [],
            workspaceFolder: "/home/robert/Scratch/policy-synth-engineer-tests/agents",
            taskTitle: "",
            taskDescription: ``,
            taskInstructions: ``,
            docsSiteToScan: [], // Hardcoded docs sites to scan that will be scanned even if they are not found through the autoamted web research
        };
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4096,
            modelName: "gpt-4o",
            verbose: true,
        });
        if (this.githubIssueUrl) {
            this.fetchGitHubIssue(this.githubIssueUrl)
                .then((issue) => {
                console.log("Github body", issue.body);
                const parsedDescription = this.parseIssueBody(issue.body);
                if (!parsedDescription) {
                    throw new Error("Failed to parse Task Description and Task Instructions from the issue body.");
                }
                this.memory.taskTitle = issue.title;
                this.memory.taskDescription = parsedDescription.taskDescription;
                this.memory.taskInstructions = parsedDescription.taskInstructions;
                console.log(`GitHub Issue Desc: ${parsedDescription.taskDescription}`);
                console.log(`GitHub Issue Task: ${parsedDescription.taskInstructions}`);
            })
                .catch((error) => {
                console.error(error.message);
            });
        }
    }
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
            console.log(`GitHub Issue Title: ${issue.title}`);
            console.log(`GitHub Issue Desc: ${parsedDescription.taskDescription}`);
            console.log(`GitHub Issue Task: ${parsedDescription.taskInstructions}`);
        }
    }
    async fetchGitHubIssue(url) {
        try {
            const apiUrl = this.convertToApiUrl(url);
            const response = await axios.get(apiUrl);
            const issue = {
                title: response.data.title,
                body: response.data.body,
            };
            return issue;
        }
        catch (error) {
            throw new Error(`Failed to fetch issue: ${error.message}`);
        }
    }
    convertToApiUrl(issueUrl) {
        const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
        const match = issueUrl.match(regex);
        if (!match) {
            throw new Error("Invalid GitHub issue URL");
        }
        const [, owner, repo, issueNumber] = match;
        return `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    }
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
    removeCommentsFromCode(code) {
        return strip(code);
    }
    removeWorkspacePathFromFileIfNeeded(filePath) {
        return filePath.replace(this.memory.workspaceFolder, "");
    }
    addWorkspacePathToFileIfNeeded(filePath) {
        return path.join(this.memory.workspaceFolder, filePath);
    }
    async doWebResearch() {
        const exampleResearcher = new PsAgentFactoryExamplesWebResearchAgent(this.memory);
        const docsResearcher = new PsAgentFactoryDocsWebResearchAgent(this.memory);
        const [exampleContextItems, docsContextItems] = await Promise.all([
            exampleResearcher.doWebResearch(),
            docsResearcher.doWebResearch(),
        ]);
        this.memory.exampleContextItems = exampleContextItems;
        this.memory.docsContextItems = docsContextItems;
        this.memory.actionLog.push("Web research completed");
    }
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
    async searchDtsFilesInNodeModules() {
        const dtsFiles = [];
        const readDtsFilesRecursively = async (directory) => {
            try {
                const entries = fs.readdirSync(directory, { withFileTypes: true });
                console.log(`Reading directory: ${directory}`);
                for (const entry of entries) {
                    const fullPath = path.join(directory, entry.name);
                    if (entry.isDirectory()) {
                        // Recursively read nested directories
                        console.log(`Entering directory: ${fullPath}`);
                        await readDtsFilesRecursively(fullPath);
                    }
                    else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
                        // Add file to list if it's a .d.ts file
                        console.log(`Found .d.ts file: ${fullPath}`);
                        dtsFiles.push(fullPath);
                    }
                    else {
                        console.log(`Skipping: ${fullPath}`);
                    }
                }
            }
            catch (error) {
                console.error(`Error reading directory ${directory}: ${error}`);
            }
        };
        const searchPackages = async () => {
            if (this.memory.likelyRelevantNpmPackageDependencies &&
                this.memory.likelyRelevantNpmPackageDependencies.length > 0) {
                console.log(`Searching packages: ${this.memory.likelyRelevantNpmPackageDependencies.join(", ")}`);
                for (const packageName of this.memory
                    .likelyRelevantNpmPackageDependencies) {
                    const packagePath = path.join(this.memory.workspaceFolder, "node_modules", packageName);
                    console.log(`Searching package: ${packagePath}`);
                    await readDtsFilesRecursively(packagePath);
                }
            }
            else {
                this.logger.warn("No npm packages to search for .d.ts files");
            }
        };
        await searchPackages();
        // Call LLM to filter relevant .d.ts files
        console.log("Filtering relevant .d.ts files", dtsFiles);
        const relevantDtsFiles = await this.filterRelevantDtsFiles(dtsFiles);
        console.log(`Relevant .d.ts files: ${relevantDtsFiles.join(", ")}`);
        return relevantDtsFiles;
    }
    async filterRelevantDtsFiles(dtsFiles, addMinOneFileInstructions = false) {
        dtsFiles = dtsFiles.map((filePath) => this.removeWorkspacePathFromFileIfNeeded(filePath));
        const getSystemPrompt = (addInstruction) => `You are an expert software engineering analyzer.

Instructions:
1. You will receive a list of .d.ts file paths from the user to analyze.
2. Always output the d.ts file paths again that are possibly to be relevant for the upcoming user task.
3. Sometimes the relevant file might be called index.d.ts so look at the whole paths of the files.
${addInstruction
            ? "4. Always output at least one d.ts file, the best one to help with the task at hand."
            : ""}

Only output a JSON array with possibly relevant d.ts files, no explanations before or after the JSON string[].

<UpcomingUserTask>
  Task title: ${this.memory.taskTitle}
  Task description: ${this.memory.taskDescription}
  Task instructions: ${this.memory.taskInstructions}
</UpcomingUserTask>
`;
        const userPrompt = `List of .d.ts files to analyze for relevance to the task:
${JSON.stringify(dtsFiles, null, 2)}

Please return a JSON string array of the relevant files:`;
        let relevantFiles = [];
        let retryCount = 0;
        while (retryCount < 5) {
            const systemPrompt = getSystemPrompt(addMinOneFileInstructions);
            try {
                relevantFiles = (await this.callLLM("engineering-agent", PsConstants.engineerModel, [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)], true));
                console.log(JSON.stringify(relevantFiles, null, 2));
                relevantFiles = relevantFiles.map((filePath) => this.addWorkspacePathToFileIfNeeded(filePath));
                console.log("Filtered relevant files", relevantFiles);
                if (relevantFiles.length > 0) {
                    return relevantFiles;
                }
            }
            catch (error) {
                console.error("Error parsing LLM response:", error);
            }
            retryCount++;
            if (retryCount > 0) {
                addMinOneFileInstructions = true;
            }
        }
        return relevantFiles;
    }
    async run() {
        await this.initializeFromGitHubIssue();
        this.memory.allTypescriptSrcFiles = await this.readAllTypescriptFileNames(this.memory.workspaceFolder);
        //TODO: Get .d.ts file for npms also likely to be relevant from the nodes_modules folder
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
        //console.log(`All typescript defs: ${this.memory.allTypeDefsContents}`)
        const analyzeAgent = new PsAgentFactoryInitialAnalyzer(this.memory);
        await analyzeAgent.analyzeAndSetup();
        if (this.memory.likelyRelevantNpmPackageDependencies.length > 0) {
            const nodeModuleTypeDefs = await this.searchDtsFilesInNodeModules();
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
                process.exit(1);
            }
        }
        else {
            console.warn("No npm packages to search for .d.ts files");
        }
        this.logger.info(`All TYPEDEFS ${this.memory.allTypeDefsContents}`);
        if (this.memory.needsDocumentionsAndExamples === true) {
            await this.doWebResearch();
        }
        const programmer = new PsAgentFactoryProgrammingAgent(this.memory);
        await programmer.implementTask();
    }
    loadFileContents(fileName) {
        try {
            const content = fs.readFileSync(fileName, "utf-8");
            return content;
        }
        catch (error) {
            console.error(`Error reading file ${fileName}: ${error}`);
            return null;
        }
    }
}
//# sourceMappingURL=agent.js.map