import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsEngineerInitialAnalyzer } from "./analyze/initialAnalyzer.js";
import { PsEngineerExamplesWebResearchAgent } from "./webResearch/examplesWebResearch.js";
import { PsEngineerDocsWebResearchAgent } from "./webResearch/documentationWebResearch.js";
import { PsEngineerProgrammingAgent } from "./programming/programmingAgent.js";
import fs from "fs";
import path from "path";
import strip from "strip-comments";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import axios from 'axios';
export class PSEngineerAgent extends PolicySynthAgentBase {
    memory;
    githubIssueUrl;
    constructor(githubIssueUrl = undefined) {
        super();
        this.githubIssueUrl = githubIssueUrl;
        this.memory = {
            actionLog: [],
            workspaceFolder: "/home/robert/Scratch/policy-synth-engineer-tests/agents",
            taskTitle: "Add a new LLM model class for OpenAI on Azure",
            taskDescription: `We want to add a new model class into src/models/azureOpenAiChat.ts using the @azure/openai npm module.`,
            taskInstructions: `1. Add a new model class in src/models/azureOpenAiChat.ts using the @azure/openai npm module based on src/models/baseChatModel.ts parent class.`,
            stages: PSEngineerAgent.emptyDefaultStages,
            docsSiteToScan: [
                "https://www.npmjs.com/package/@azure/openai",
            ],
        };
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4096,
            modelName: "gpt-4o",
            verbose: true,
        });
        if (this.githubIssueUrl) {
            this.fetchGitHubIssue(this.githubIssueUrl).then(issue => {
                const parsedDescription = this.parseIssueBody(issue.body);
                if (!parsedDescription) {
                    throw new Error("Failed to parse Task Description and Task Instructions from the issue body.");
                }
                this.memory.taskTitle = issue.title;
                this.memory.taskDescription = parsedDescription.taskDescription;
                this.memory.taskInstructions = parsedDescription.taskInstructions;
                console.log(`GitHub Issue Desc: ${parsedDescription.taskDescription}`);
                console.log(`GitHub Issue Task: ${parsedDescription.taskInstructions}`);
            }).catch(error => {
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
            // Convert the GitHub issue URL to the API endpoint
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
            throw new Error('Invalid GitHub issue URL');
        }
        const [, owner, repo, issueNumber] = match;
        return `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    }
    parseIssueBody(body) {
        const descriptionMatch = body.match(/\*Task Description\*\s*([^*]+)/s);
        const instructionsMatch = body.match(/\*Task Instructions\*\s*([^*]+)/s);
        if (descriptionMatch && instructionsMatch) {
            return {
                taskDescription: descriptionMatch[1].trim(),
                taskInstructions: instructionsMatch[1].trim(),
            };
        }
        else {
            return null;
        }
    }
    removeCommentsFromCode(code) {
        return strip(code);
    }
    removeWorkspacePathFromFileIfNeeded(filePath) {
        return filePath.replace(this.memory.workspaceFolder, "");
    }
    async doWebResearch() {
        const exampleResearcher = new PsEngineerExamplesWebResearchAgent(this.memory);
        const docsResearcher = new PsEngineerDocsWebResearchAgent(this.memory);
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
                for (const entry of entries) {
                    const fullPath = path.join(directory, entry.name);
                    if (entry.isDirectory()) {
                        // Recursively read nested directories
                        await readDtsFilesRecursively(fullPath);
                    }
                    else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
                        // Add file to list if it's a .d.ts file
                        dtsFiles.push(fullPath);
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
                for (const packageName of this.memory
                    .likelyRelevantNpmPackageDependencies) {
                    const packagePath = path.join(this.memory.workspaceFolder, "node_modules", packageName);
                    await readDtsFilesRecursively(packagePath);
                }
            }
            else {
                this.logger.warn("No npm packages to search .d.ts files");
            }
        };
        await searchPackages();
        // Call LLM to filter relevant .d.ts files
        const relevantDtsFiles = await this.filterRelevantDtsFiles(dtsFiles);
        return relevantDtsFiles;
    }
    async filterRelevantDtsFiles(dtsFiles) {
        const prompt = `You are an expert software engineering analyzer. You will receive a list of .d.ts files. Please identify which files are likely to be relevant for the current task.

Only output a JSON array with file nothing else, no explainations before or after the JSON string[].

Task title: ${this.memory.taskTitle}
Task description: ${this.memory.taskDescription}
Task instructions: ${this.memory.taskInstructions}

List of .d.ts files:
${dtsFiles.join("\n")}

Please return a JSON array of the relevant file paths:`;
        const relevantFiles = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [new SystemMessage(prompt)], true);
        try {
            console.log(JSON.stringify(relevantFiles, null, 2));
            return relevantFiles;
        }
        catch (error) {
            console.error("Error parsing LLM response:", error);
            return [];
        }
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
        const analyzeAgent = new PsEngineerInitialAnalyzer(this.memory);
        await analyzeAgent.analyzeAndSetup();
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
        this.logger.info(`All TYPEDEFS ${this.memory.allTypeDefsContents}`);
        if (this.memory.needsDocumentionsAndExamples === true) {
            await this.doWebResearch();
        }
        const programmer = new PsEngineerProgrammingAgent(this.memory);
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