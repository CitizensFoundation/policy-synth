import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";

import fs from "fs";
import path from "path";

export class PsAgentFactoryInitialAnalyzer extends PolicySynthScAgentBase {
  override memory: PsAgentFactoryMemoryData;

  constructor(memory: PsAgentFactoryMemoryData) {
    super(memory);
    this.memory = memory;
    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 4096,
      modelName: "gpt-4o",
      verbose: true,
    });
  }

  readNpmDependencies() {
    const packageJsonPath = path.join(
      this.memory.workspaceFolder,
      "package.json"
    );
    const packageJsonData = fs.readFileSync(packageJsonPath, "utf8");
    const packageJsonObj = JSON.parse(packageJsonData);

    return packageJsonObj.dependencies;
  }

  get analyzeSystemPrompt() {
    return `Your are an expert software engineering analyzer.

      Instructions:
      1. Review the task name, description and instructions.
      2. You will see a list of all existing typescript files, output ones likely to change to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext for files likely to be relevant.
      3. You will see a list of all npm module dependencies, you should output likely to be relevant to likelyRelevantNpmPackageDependencies.
      4. You will see a list of all possible documentation files, you should output likely to be relevant to documentationFilesToKeepInContext.
      5. Always include all typedef d.ts files in the existingOtherTypescriptFilesToKeepInContext JSON field.
      6. Always output the full path into all the JSON string arrays.
      7. Only add files that already exist in existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext JSON fields
      8. Never add new files to add to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext JSON fields add them to newLikelyFilesToAdd.
      9. Important: If the programming task is likely to benefit documentation or examples from online sources, set needsDocumentionsAndExamples to true.

      JSON Output Schema:
      {
        newLikelyFilesToAdd: string[];
        existingTypeScriptFilesLikelyToChange: string[];
        existingOtherTypescriptFilesToKeepInContext: string[];
        documentationFilesToKeepInContext: string[];
        likelyRelevantNpmPackageDependencies: string[];
        needsDocumentionsAndExamples: boolean;
      }
    `;
  }

  analyzeUserPrompt(
    allNpmPackageDependencies: string[],
    allDocumentationFiles: string[]
  ) {
    return `All npm package.json dependencies:
    ${JSON.stringify(allNpmPackageDependencies, null, 2)}

    All documentation files in workspace:
    ${allDocumentationFiles.join("\n")}

    All already existing typescript files in workspace:
    ${this.memory.allTypescriptSrcFiles?.join("\n")}

    Task title: ${this.memory.taskTitle}
    Task description: ${this.memory.taskDescription}
    Task instructions: ${this.memory.taskInstructions}

    Your JSON Output:
    `;
  }

  async analyzeAndSetup() {
    this.logger.info(`Analyzing and setting up task`)
    const allNpmPackageDependencies = this.readNpmDependencies();
    const getAllDocumentationFiles = (folderPath: string): string[] => {
      const files: string[] = [];
      const items = fs.readdirSync(folderPath);
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);
        if (
          stat.isDirectory() &&
          item !== "ts-out" &&
          item !== "node_modules"
        ) {
          files.push(...getAllDocumentationFiles(itemPath));
        } else if (path.extname(item) === ".md") {
          files.push(itemPath);
        }
      }
      return files;
    };

    const allDocumentationFiles = getAllDocumentationFiles(
      this.memory.workspaceFolder
    );

    const analyzisResults = (await this.callLLM(
      "engineering-agent",
      PsConstants.engineerModel,
      [
        new SystemMessage(this.analyzeSystemPrompt),
        new HumanMessage(
          this.analyzeUserPrompt(
            allNpmPackageDependencies,
            allDocumentationFiles
          )
        ),
      ],
      true
    )) as PsAgentFactoryPlanningResults;

    console.log(`Results: ${JSON.stringify(analyzisResults, null, 2)}`)

    this.memory.existingTypeScriptFilesLikelyToChange =
      analyzisResults.existingTypeScriptFilesLikelyToChange;

    this.memory.existingOtherTypescriptFilesToKeepInContext =
      analyzisResults.existingOtherTypescriptFilesToKeepInContext;

    this.memory.likelyRelevantNpmPackageDependencies =
      analyzisResults.likelyRelevantNpmPackageDependencies;

    this.memory.needsDocumentionsAndExamples =
      analyzisResults.needsDocumentionsAndExamples;

    this.memory.documentationFilesToKeepInContext =
      analyzisResults.documentationFilesToKeepInContext;

    this.memory.actionLog.push(
      `Have done initial analysis${
        analyzisResults.needsDocumentionsAndExamples
          ? " and we need to search for context"
          : ""
      }`
    );
  }
}
