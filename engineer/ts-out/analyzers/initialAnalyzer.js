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
            verbose: false,
        });
    }
    readDependencies() {
        const packageJsonPath = path.join(__dirname, "package.json");
        const packageJsonData = fs.readFileSync(packageJsonPath, "utf8");
        const packageJsonObj = JSON.parse(packageJsonData);
        return packageJsonObj.dependencies;
    }
    get analyzeSystemPrompt() {
        return `Your are an expert software engineering planneer.

      Instructions:
      1. Review the task name, description and instructions.
      2. You will see a list of all typescript files, output ones likely to change to otherFilesToKeepInContext and otherFilesToKeepInContext for files likely to be relevant.
      3. You will see a list of all npm module dependencies, you should output likely to change to likelyRelevantNpmPackageDependencies.
      3. Always include all typedef d.ts files in the context.
      4. If the task needs documentation or examples, set needsDocumentionsAndExamples to true - this will trigger an automated Google search for the needed files.

      JSON Output Schema:
      {
        filesLikelyToChange: string[];
        otherFilesToKeepInContext: string[];
        likelyRelevantNpmPackageDependencies: string[];
        needsDocumentionsAndExamples: boolean;
      }
    `;
    }
    analyzeUserPrompt(allNpmPackageDependencies) {
        return `Task title: ${this.memory.taskTitle}
    Task description: ${this.memory.taskDescription}
    Task instructions: ${this.memory.taskInstructions}

    All npm package.json dependencies:
    ${allNpmPackageDependencies.join("\n")}

    All typescript files in workspace:
    ${this.memory.allTypescriptSrcFiles?.join("\n")}

    Your JSON Output:
    `;
    }
    async analyzeAndSetup() {
        const allNpmPackageDependencies = this.readDependencies();
        const analyzisResults = (await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
            new SystemMessage(this.analyzeSystemPrompt),
            new HumanMessage(this.analyzeUserPrompt(allNpmPackageDependencies)),
        ]));
        this.memory.filesLikelyToChange = analyzisResults.filesLikelyToChange;
        this.memory.otherFilesToKeepInContext =
            analyzisResults.otherFilesToKeepInContext;
        this.memory.likelyRelevantNpmPackageDependencies = analyzisResults.likelyRelevantNpmPackageDependencies;
        this.memory.actionLog.push(`Have done initial analysis${analyzisResults.needsDocumentionsAndExamples
            ? " and we need to search for context"
            : ""}`);
        if (analyzisResults.needsDocumentionsAndExamples) {
            this.memory.contextItems = await this.searchForContext();
            this.memory.actionLog.push(`Have searched for initial documentation and examples context`);
        }
    }
    async searchForContext() {
        const contextItems = [];
        return contextItems;
    }
}
//# sourceMappingURL=initialAnalyzer.js.map