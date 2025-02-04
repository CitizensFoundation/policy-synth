import fs from "fs";
import path from "path";

import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsEngineerAgentBase } from "../agentBase.js";

export class PsEngineerInitialAnalyzer extends PsEngineerAgentBase {
  declare memory: PsEngineerMemoryData;

  override get maxModelTokensOut(): number {
    return 80000;
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
  2. You will see a list of all existing typescript files in <AllTypescriptFiles>, output ones likely to change to existingTypeScriptFilesLikelyToChange.
  3. You will see a list of all npm module dependencies, you should output likely to be relevant to likelyRelevantNpmPackageDependencies.
  4. You will see a list of all possible documentation files, you should output likely to be relevant to documentationFilesToKeepInContext.
  5. Instructions on how to use <AllDefinitionTypescriptFiles>:
  5.1. Look in <AllDefinitionTypescriptFiles> and add all possibly relevant *.d.ts files to the "usefulTypescriptDefinitionFilesToKeepInContext" JSON array.
  5.2. Look at the name of the file d.ts file, if it is possibly relevant add it to the JSON array.
  5.3. VERY IMPORTANT: The main shared *.d.ts typedef files are often stored in the webApps/ folder structure so consider adding these to the usefulTypescriptDefinitionFilesToKeepInContext JSON array.
  6. Look in <AllCodeTypescriptFiles> and add all typescripts code files that are could be relevant, but might not need changing in usefulTypescriptCodeFilesToKeepInContext.
  7. Always output the full file path into all the JSON string arrays.
  8. Important: If the programming task is needs examples from online sources, if some specific library is being used or something new added set needsDocumentationAndExamples to true.
</ImportantInstructions>
<OutputJsonSchema>
{
  newLikelyFilesToAdd: string[];
  existingTypeScriptFilesLikelyToChange: string[];
  usefulTypescriptDefinitionFilesToKeepInContext: string[];
  usefulTypescriptCodeFilesToKeepInContext: string[];
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

    TASK: Analyze the TheUserCodingTaskInstructions and the provided context, then output the JSON output as per the schema.

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

  /**
   * A generalized method that filters a list of files by relevance
   * using an LLM. By default, if the LLM output does not explicitly
   * say "Not Relevant", the file is retained ("err on the side of including").
   *
   * @param filePaths - The files to be evaluated
   * @param userTaskInstructions - The high-level instructions / context for relevance
   * @param typeLabel - A label to include in logs or prompts (e.g. "documentation", "type definitions", "code")
   * @param systemPromptOverload - Optional system prompt override
   * @param userPromptOverload - Optional user prompt override
   * @returns A Promise resolving to an array of relevant file paths
   */
  async filterFilesByRelevance(
    filePaths: string[],
    userTaskInstructions: string,
    typeLabel: string,
    systemPromptOverload?: string,
    userPromptOverload?: string
  ): Promise<string[]> {
    this.logger.info(`Analyzing relevance for ${typeLabel}...`);
    await this.updateRangedProgress(
      undefined,
      `Analyzing relevance for ${typeLabel}...`
    );

    if (!filePaths || filePaths.length === 0) {
      this.logger.info(`No files to analyze for ${typeLabel}.`);
      return [];
    }

    const relevantFiles: string[] = [];

    // Base system prompt
    const defaultSystemPrompt = `<ImportantInstructions>
You are a specialized file relevance analyzer for coding tasks. You will receive:
1. The user's coding task instructions.
2. The content of a single file (like documentation, type definitions, or code).
Based on the provided content and task instructions, decide if the file is "Relevant" or "Not Relevant".
</ImportantInstructions>
    `;

    // Base user prompt
    const defaultUserPrompt = `<CodeLikelyToChangeInTheCodingTask>
${this.memory.existingTypeScriptFilesLikelyToChangeContents}
</CodeLikelyToChangeInTheCodingTask>

<TheUserCodingTaskInstructions>
${userTaskInstructions || "No user instructions provided."}
</TheUserCodingTaskInstructions>

<FileToCheck type="${typeLabel}">
CONTENT_PLACEHOLDER
</FileToCheck>

TASK:
Output just a single word: either "Relevant" or "Not Relevant".
    `;

    const systemPrompt = systemPromptOverload || defaultSystemPrompt;
    const userPromptTemplate = userPromptOverload || defaultUserPrompt;

    for (const filePath of filePaths) {
      let fileContent = "";
      try {
        if (fs.existsSync(filePath)) {
          fileContent = fs.readFileSync(filePath, "utf8");
        } else {
          this.logger.warn(`File not found: ${filePath}`);
          // We'll skip if file not found
          continue;
        }
      } catch (error) {
        this.logger.error(`Error reading file ${filePath}:`, error);
        continue;
      }

      // Insert the file content into the user prompt
      const userPrompt = userPromptTemplate.replace(
        "CONTENT_PLACEHOLDER",
        fileContent
      );

      this.startTiming();

      let rawResponse: string | object;
      try {
        rawResponse = await this.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Small,
          [this.createSystemMessage(systemPrompt), this.createHumanMessage(userPrompt)],
          false
        );

        await this.addTimingResult("FilterFilesByRelevance");
      } catch (err) {
        this.logger.error(`Error calling model for file ${filePath}:`, err);
        // If there's an error with the model, we keep the file by default
        relevantFiles.push(filePath);
        continue;
      }

      let relevance: "Relevant" | "Not Relevant" | undefined;
      if (typeof rawResponse === "string") {
        const trimmedResponse = rawResponse.trim().toLowerCase();
        if (trimmedResponse.includes("not relevant")) {
          relevance = "Not Relevant";
        } else if (trimmedResponse.includes("relevant")) {
          relevance = "Relevant";
        } else {
          // If the model doesn't strictly say "Not Relevant", err on "Relevant"
          relevance = "Relevant";
        }
      } else {
        // If we got a non-string response, default to relevant
        relevance = "Relevant";
      }

      this.logger.info(`File ${filePath} evaluated as: ${relevance}`);
      if (relevance !== "Not Relevant") {
        relevantFiles.push(filePath);
        this.memory.acceptedFilesForRelevance.push(filePath);
      } else {
        this.memory.rejectedFilesForRelevance.push(filePath);
      }
    }

    const removedCount = filePaths.length - relevantFiles.length;
    this.logger.info(
      `For ${typeLabel}, removed ${removedCount} files as "Not Relevant".`
    );

    return relevantFiles;
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

    this.startTiming();

    // Use the new callModel approach
    const analysisResponse = await this.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      [
        this.createSystemMessage(this.analyzeSystemPrompt),
        this.createHumanMessage(
          this.analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles)
        ),
      ],
      false
    );

    await this.addTimingResult("Analyzer Agent");

    let analyzisResults: PsEngineerPlanningResults;

    if (typeof analysisResponse === "string") {
      analyzisResults = JSON.parse(analysisResponse);
    } else {
      // if the LLM returned an object (already parsed)
      analyzisResults = analysisResponse as PsEngineerPlanningResults;
    }

    this.memory.analysisResults = analyzisResults;

    await this.saveMemory();

    console.log(`Results: ${JSON.stringify(analyzisResults, null, 2)}`);

    // Store the results into memory
    this.memory.existingTypeScriptFilesLikelyToChange =
      analyzisResults.existingTypeScriptFilesLikelyToChange;
    this.memory.usefulTypescriptDefinitionFilesToKeepInContext =
      analyzisResults.usefulTypescriptDefinitionFilesToKeepInContext;

    this.memory.usefulTypescriptCodeFilesToKeepInContext =
      analyzisResults.usefulTypescriptCodeFilesToKeepInContext.filter(
        (file) =>
          !analyzisResults.existingTypeScriptFilesLikelyToChange.includes(file)
      );

    this.memory.likelyRelevantNpmPackageDependencies =
      analyzisResults.likelyRelevantNpmPackageDependencies;
    this.memory.needsDocumentationAndExamples =
      analyzisResults.needsDocumentationAndExamples;

    this.memory.documentationFilesToKeepInContext =
      analyzisResults.documentationFilesToKeepInContext;

    this.memory.existingTypeScriptFilesLikelyToChangeContents = this.getFilesContents(
      analyzisResults.existingTypeScriptFilesLikelyToChange
    );

    this.memory.actionLog.push(
      `Have done initial analysis${
        analyzisResults.needsDocumentationAndExamples
          ? " and we need to search for context"
          : ""
      }`
    );

    // -- Apply the new general relevance filtering function --
    // Filter out documentation files that are not relevant
    this.memory.documentationFilesToKeepInContext = await this.filterFilesByRelevance(
      this.memory.documentationFilesToKeepInContext,
      this.memory.taskInstructions || "",
      "documentation"
    );

    // Filter out definitions that are not relevant
    this.memory.usefulTypescriptDefinitionFilesToKeepInContext =
      await this.filterFilesByRelevance(
        this.memory.usefulTypescriptDefinitionFilesToKeepInContext,
        this.memory.taskInstructions || "",
        "possibly relevant type definitions"
      );

    // Filter out code files that are not relevant
    this.memory.usefulTypescriptCodeFilesToKeepInContext =
      await this.filterFilesByRelevance(
        this.memory.usefulTypescriptCodeFilesToKeepInContext,
        this.memory.taskInstructions || "",
        "possibly relevant typescript code"
      );

    this.memory.actionLog.push(
      "Filtered documentation, definition files, and code files by relevance."
    );

    await this.saveMemory();
  }
}
