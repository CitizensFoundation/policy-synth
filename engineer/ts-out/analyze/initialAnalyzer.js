import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";
import fs from "fs";
import path from "path";
export class PsEngineerInitialAnalyzer extends PolicySynthAgentBase {
    memory;
    constructor(memory) {
        super(memory);
        this.memory = memory;
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4000,
            modelName: IEngineConstants.engineerModel.name,
            verbose: true,
        });
    }
    readNpmDependencies() {
        const packageJsonPath = path.join(this.memory.workspaceFolder, "package.json");
        const packageJsonData = fs.readFileSync(packageJsonPath, "utf8");
        const packageJsonObj = JSON.parse(packageJsonData);
        console.log(packageJsonObj.dependencies);
        return packageJsonObj.dependencies;
    }
    get analyzeSystemPrompt() {
        return `Your are an expert software engineering analyzer.

      Instructions:
      1. Review the task name, description and instructions.
      2. You will see a list of all typescript files, output ones likely to change to typeScriptFilesLikelyToChange and otherTypescriptFilesToKeepInContext for files likely to be relevant.
      3. You will see a list of all npm module dependencies, you should output likely to be relevant to likelyRelevantNpmPackageDependencies.
      4. You will see a list of all possible documentation files, you should output likely to be relevant to documentationFilesToKeepInContext.
      5. Always include all typedef d.ts files in the otherTypescriptFilesToKeepInContext at the end.
      6. Always output the full path into all the JSON string arrays.
      7. Only add files that already exist in typeScriptFilesLikelyToChange not new files that are planned.
      8. If the task is likely to need documentation or examples from online sources, set needsDocumentionsAndExamples to true - this will trigger an automated Google search for the task.

      JSON Output Schema:
      {
        typeScriptFilesLikelyToChange: string[];
        otherTypescriptFilesToKeepInContext: string[];
        documentationFilesToKeepInContext: string[];
        likelyRelevantNpmPackageDependencies: string[];
        needsDocumentionsAndExamples: boolean;
      }
    `;
    }
    analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles) {
        return `Task title: ${this.memory.taskTitle}
    Task description: ${this.memory.taskDescription}
    Task instructions: ${this.memory.taskInstructions}

    All npm package.json dependencies:
    ${JSON.stringify(allNpmPackageDependencies, null, 2)}

    All documentation files in workspace:
    ${allDocumentationFiles.join("\n")}

    All typescript files in workspace:
    ${this.memory.allTypescriptSrcFiles?.join("\n")}

    Your JSON Output:
    `;
    }
    async analyzeAndSetup() {
        const allNpmPackageDependencies = this.readNpmDependencies();
        const getAllDocumentationFiles = (folderPath) => {
            const files = [];
            const items = fs.readdirSync(folderPath);
            for (const item of items) {
                const itemPath = path.join(folderPath, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory() &&
                    item !== "ts-out" &&
                    item !== "node_modules") {
                    files.push(...getAllDocumentationFiles(itemPath));
                }
                else if (path.extname(item) === ".md") {
                    files.push(itemPath);
                }
            }
            return files;
        };
        const allDocumentationFiles = getAllDocumentationFiles(this.memory.workspaceFolder);
        console.log(`-----! ${IEngineConstants.engineerModel}`);
        const analyzisResults = (await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
            new SystemMessage(this.analyzeSystemPrompt),
            new HumanMessage(this.analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles)),
        ], true));
        this.memory.typeScriptFilesLikelyToChange =
            analyzisResults.typeScriptFilesLikelyToChange;
        this.memory.otherTypescriptFilesToKeepInContext =
            analyzisResults.otherTypescriptFilesToKeepInContext;
        this.memory.likelyRelevantNpmPackageDependencies =
            analyzisResults.likelyRelevantNpmPackageDependencies;
        this.memory.needsDocumentionsAndExamples =
            analyzisResults.needsDocumentionsAndExamples;
        this.memory.documentationFilesToKeepInContext =
            analyzisResults.documentationFilesToKeepInContext;
        this.memory.actionLog.push(`Have done initial analysis${analyzisResults.needsDocumentionsAndExamples
            ? " and we need to search for context"
            : ""}`);
    }
}
//# sourceMappingURL=initialAnalyzer.js.map