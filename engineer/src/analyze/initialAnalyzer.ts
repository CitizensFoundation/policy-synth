import fs from "fs";
import path from "path";

import { PsConstants } from "@policysynth/agents/constants.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js"; // or your new base agent
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent";

export class PsEngineerInitialAnalyzer extends PolicySynthAgent {
  declare memory: PsEngineerMemoryData;

  override get maxModelTokensOut(): number {
    return 100000;
  }

  override get modelTemperature(): number {
    return 0.0;
  }

  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
  }

  constructor(
    agent: PsAgent,
    memory: PsEngineerMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
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
    return `<ImportantInstructions>
  1. Review the task name, description and instructions. You might just see the task instructions.
  2. You will see a list of all existing typescript files in <AllTypescriptFiles>, output ones likely to change to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptDefinitionFilesToKeepInContext for files likely to be relevant.
  3. You will see a list of all npm module dependencies, you should output likely to be relevant to likelyRelevantNpmPackageDependencies.
  4. You will see a list of all possible documentation files, you should output likely to be relevant to documentationFilesToKeepInContext.
  5. Look in <AllDefinitionTypescriptFiles> and add all possibly relevant *.d.ts files to the existingOtherTypescriptDefinitionFilesToKeepInContext JSON field, only exclude *.d.ts files that are clearly 100% not relevant.
  6. Look in <AllCodeTypescriptFiles> and add all typescripts code files that are very likely to be relevant, but might not need changing in existingTypeScriptFilesLikelyToChange.
  7. Always output the full file path into all the JSON string arrays.
  8. Only add files that already exist in existingTypeScriptFilesLikelyToChange and existingOtherTypescriptDefinitionFilesToKeepInContext JSON fields
  9. Never add new files to add to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptDefinitionFilesToKeepInContext JSON fields add them to newLikelyFilesToAdd.
  10. Important: If the programming task is needs examples from online sources, if some specific library is being used or something new added set needsDocumentationAndExamples to true.
</ImportantInstructions>
<OutputJsonSchema>
{
  newLikelyFilesToAdd: string[];
  existingTypeScriptFilesLikelyToChange: string[];
  existingOtherTypescriptDefinitionFilesToKeepInContext: string[];
  existingOtherTypescriptCodeFilesToKeepInContext: string[];
  documentationFilesToKeepInContext: string[];
  likelyRelevantNpmPackageDependencies: string[];
  needsDocumentationAndExamples: boolean;
}
</OutputJsonSchema>
    `;
  }

  analyzeUserPrompt(
    allNpmPackageDependencies: string[],
    allDocumentationFiles: string[]
  ) {
    const allTypescriptDefFiles = this.memory.allTypescriptSrcFiles?.filter(
      (file) => file.endsWith(".d.ts")
    );

    const allTypescriptCodeFiles = this.memory.allTypescriptSrcFiles?.filter(
      (file) => file.endsWith(".ts") && !file.endsWith(".d.ts")
    );

    return `<AllNpmPackageDependencies>
    ${JSON.stringify(allNpmPackageDependencies, null, 2)}
    </AllNpmPackageDependencies>

    <AllDocumentationFiles>
    ${allDocumentationFiles.join("\n")}
    </AllDocumentationFiles>

    ${
      allTypescriptDefFiles
        ? `<AllDefinitionTypescriptFiles>
    ${allTypescriptDefFiles.join("\n")}
    </AllDefinitionTypescriptFiles>`
        : ""
    }

    ${
      allTypescriptCodeFiles
        ? `<AllCodeTypescriptFiles>
    ${allTypescriptCodeFiles.join("\n")}
    </AllCodeTypescriptFiles>`
        : ""
    }

    ${
      this.memory.taskTitle
        ? `<TheUserCodingTaskTitle>${this.memory.taskTitle}</TheUserCodingTaskTitle>`
        : ""
    }
    ${
      this.memory.taskDescription
        ? `<TheUserCodingTaskDescription>${this.memory.taskDescription}</TheUserCodingTaskDescription>`
        : ""
    }
    ${
      this.memory.taskInstructions
        ? `\n<TheUserCodingTaskInstructions>${this.memory.taskInstructions}</TheUserCodingTaskInstructions>\n`
        : ""
    }

    TASK: Analyze the TheUserCodingTaskInstructions and the provided context output the JSON output as per the schema.

    Your JSON Output:
    `;
  }

  getFilesContents(filePaths: string[]): string {
    let contentsStr = "";
    filePaths.forEach((filePath) => {
      let fileContent = "";
      try {
        if (fs.existsSync(filePath)) {
          fileContent = fs.readFileSync(filePath, "utf8");
        } else {
          this.logger.warn(`File not found: ${filePath}`);
        }
      } catch (err) {
        this.logger.error(`Error reading file ${filePath}:`, err);
      }
      contentsStr += `<CodeLikelyToChange filename="${filePath}">
${fileContent}
</CodeLikelyToChange>
`;
    });
    return contentsStr;
  }

  async analyzeAndSetup() {
    this.logger.info(`Analyzing and setting up task`);

    // Read dependencies from package.json
    const allNpmPackageDependencies = this.readNpmDependencies();

    // Utility to find all .md docs recursively
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

    // Use the new callModel approach
    const analysisResponse = await this.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Medium,
      [
        this.createSystemMessage(this.analyzeSystemPrompt),
        this.createHumanMessage(
          this.analyzeUserPrompt(
            allNpmPackageDependencies,
            allDocumentationFiles
          )
        ),
      ],
      false // not streaming, set to true if you want streamed responses
    );

    let analyzisResults: PsEngineerPlanningResults;

    if (typeof analysisResponse === "string") {
      analyzisResults = JSON.parse(analysisResponse);
    } else {
      // if the LLM returned an object (already parsed)
      analyzisResults = analysisResponse as PsEngineerPlanningResults;
    }

    console.log(`Results: ${JSON.stringify(analyzisResults, null, 2)}`);

    // Store the results into memory
    this.memory.existingTypeScriptFilesLikelyToChange =
      analyzisResults.existingTypeScriptFilesLikelyToChange;
    this.memory.existingOtherTypescriptDefinitionFilesToKeepInContext =
      analyzisResults.existingOtherTypescriptDefinitionFilesToKeepInContext;
    this.memory.likelyRelevantNpmPackageDependencies =
      analyzisResults.likelyRelevantNpmPackageDependencies;
    this.memory.needsDocumentationAndExamples =
      analyzisResults.needsDocumentationAndExamples;
    this.memory.documentationFilesToKeepInContext =
      analyzisResults.documentationFilesToKeepInContext;

    this.memory.existingTypeScriptFilesLikelyToChangeContents =
      this.getFilesContents(
        analyzisResults.existingTypeScriptFilesLikelyToChange
      );

    this.memory.actionLog.push(
      `Have done initial analysis${
        analyzisResults.needsDocumentationAndExamples
          ? " and we need to search for context"
          : ""
      }`
    );

    await this.saveMemory();
  }
}
