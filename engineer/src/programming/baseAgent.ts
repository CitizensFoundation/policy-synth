import fs from "fs";
import { Project, ReturnTypedNode } from "ts-morph";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

/**
 * Extend PolicySynthAgent instead of the older PolicySynthScAgentBase,
 * but keep all your existing functionality and method logic.
 */
export abstract class PsEngineerBaseProgrammingAgent extends PolicySynthAgent {
  declare memory: PsEngineerMemoryData;

  documentationFilesInContextContent: string | undefined | null;
  currentFileContents: string | undefined | null;
  likelyToChangeFilesContents: string | undefined | null;
  typeDefFilesToKeepInContextContent: string | undefined | null;
  codeFilesToKeepInContextContent: string | undefined | null;
  maxRetries = 20;
  currentErrors: string | undefined | null;
  previousCurrentErrors: string | undefined | null;

  tsMorphProject: Project | undefined;

  override get maxModelTokensOut(): number {
    return 80000;
  }

  override get modelTemperature(): number {
    return 0.0;
  }

  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
  }

  /**
   * Adapted constructor: now uses PolicySynthAgent’s constructor signature.
   */
  constructor(
    agent: PsAgent,
    memory: PsEngineerMemoryData,
    startProgress = 0,
    endProgress = 100,
    {
      typeDefFilesToKeepInContextContent,
      codeFilesToKeepInContextContent,
      documentationFilesInContextContent,
      likelyToChangeFilesContents,
      tsMorphProject,
    }: {
      typeDefFilesToKeepInContextContent?: string | null;
      codeFilesToKeepInContextContent?: string | null;
      documentationFilesInContextContent?: string | null;
      likelyToChangeFilesContents?: string | null;
      tsMorphProject?: Project;
    }
  ) {
    super(agent, memory, startProgress, endProgress);

    this.typeDefFilesToKeepInContextContent =
      typeDefFilesToKeepInContextContent;
    this.codeFilesToKeepInContextContent = codeFilesToKeepInContextContent;
    this.documentationFilesInContextContent =
      documentationFilesInContextContent;
    this.likelyToChangeFilesContents = likelyToChangeFilesContents;
    this.tsMorphProject = tsMorphProject;
  }

  updateMemoryWithFileContents(fileName: string, content: string) {
    if (!this.memory.currentTask) {
      this.memory.currentTask = { filesCompleted: [] };
    }

    if (!this.memory.currentTask.filesCompleted) {
      this.memory.currentTask.filesCompleted = [];
    }

    const existingFileIndex = this.memory.currentTask.filesCompleted.findIndex(
      (f) => f.fileName === fileName
    );

    if (existingFileIndex > -1) {
      this.memory.currentTask.filesCompleted[existingFileIndex].content =
        content;
    } else {
      this.memory.currentTask.filesCompleted.push({ fileName, content });
    }

    // Ensure the first two files and the last three files are always kept
    const filesCompleted = this.memory.currentTask.filesCompleted;
    if (filesCompleted.length > 5) {
      const firstTwoFiles = filesCompleted.slice(0, 2);
      const lastThreeFiles = filesCompleted.slice(-3);
      this.memory.currentTask.filesCompleted = [
        ...firstTwoFiles,
        ...lastThreeFiles,
      ];
    }
  }

  renderCodingRules() {
    return `<ImportantCodingRulesForYourCodeGeneration>
      Always export all classes at the front of the file like "export class" or "export abstract class", never at the bottom of the file.
      Never generate import statements in TypeScript declaration files (*.d.ts) — types there are global by default.
      Never generate export statements for interfaces in TypeScript declaration files (*.d.ts files).
      Always output the full new or changed typescript file, if you are changing a file do not leave anything out from the original file, otherwise code will get lost.
    </ImportantCodingRulesForYourCodeGeneration>`;
  }

  setOriginalFileIfNeeded(fileName: string, content: string) {
    if (!this.memory.currentTask) {
      this.memory.currentTask = { filesCompleted: [] };
    }
    if (!this.memory.currentTask.originalFiles) {
      this.memory.currentTask.originalFiles = [];
    }

    const existingFileIndex = this.memory.currentTask.originalFiles.findIndex(
      (f) => f.fileName === fileName
    );
    if (existingFileIndex === -1) {
      this.memory.currentTask.originalFiles.push({
        fileName,
        content: content,
      });
    }
  }

  getCompletedFileContent() {
    if (!this.currentErrors) {
      return this.memory
        .currentTask!.filesCompleted!.map(
          (f) => `${f.fileName}:\n${f.content}\n`
        )
        .join("\n");
    } else {
      // Write out the files with line numbers to help fix errors
      return this.memory.currentTask!.filesCompleted!.map((f) => {
        const lines = f.content.split("\n");
        return `${f.fileName}:\n${lines
          .map((line, index) => `${index + 1}: ${line}`)
          .join("\n")}\n`;
      });
    }
  }

  setCurrentErrors(errors: string | undefined) {
    if (this.currentErrors) {
      this.previousCurrentErrors = this.currentErrors;
    }
    this.currentErrors = errors;
  }

  renderCurrentErrorsAndOriginalFiles() {
    return `${
      this.currentErrors
        ? `${this.renderOriginalFiles()}\n<CurrentErrorsToFixInYourPlan>${
            this.currentErrors
          }</CurrentErrorsToFixInYourPlan>`
        : ``
    }${
      this.previousCurrentErrors
        ? `\n<PreviousErrorsYouWereTryingToFix>${this.previousCurrentErrors}</PreviousErrorsYouWereTryingToFix>`
        : ``
    }`;
  }

  removeWorkspacePathFromFileIfNeeded(filePath: string) {
    return filePath.replace(this.memory.workspaceFolder, "");
  }

  renderDefaultTaskAndContext() {
    const hasContextFromSearch =
      (this.memory.exampleContextItems &&
        this.memory.exampleContextItems.length > 0) ||
      (this.memory.docsContextItems && this.memory.docsContextItems.length > 0);

    let hasCompletedFiles = false;
    if (
      this.memory.currentTask &&
      this.memory.currentTask.filesCompleted &&
      this.memory.currentTask.filesCompleted.length > 0
    ) {
      hasCompletedFiles = true;
    }

    return `${
      hasContextFromSearch
        ? `<ContextFromOnlineSearch>${
            this.memory.exampleContextItems &&
            this.memory.exampleContextItems.length > 0
              ? `Potentially relevant code examples from web search:
          ${this.memory.exampleContextItems.join("\n")}`
              : ``
          }
          ${
            this.memory.docsContextItems &&
            this.memory.docsContextItems.length > 0
              ? `\nPotentially relevant documentation from a web search:
          ${this.memory.docsContextItems.join("\n")}`
              : ``
          }
        </ContextFromOnlineSearch>`
        : ``
      }

      ${
        (this.documentationFilesInContextContent &&
          this.documentationFilesInContextContent.length > 0)
          ? `<LocalDocumentation>
              ${this.documentationFilesInContextContent}
            </LocalDocumentation>`
          : ``
      }

      ${
        this.typeDefFilesToKeepInContextContent
          ? `<TypeDefFilesLikelyRelevant>
               ${this.typeDefFilesToKeepInContextContent}
             </TypeDefFilesLikelyRelevant>`
          : ``
      }

      ${
        this.codeFilesToKeepInContextContent
          ? `<CodeFilesPossiblyRelevant>
               ${this.codeFilesToKeepInContextContent}
             </CodeFilesPossiblyRelevant>`
          : ``
      }

      <TypescriptFilesThatAreLikelyToChange>
      ${
        this.memory.existingTypeScriptFilesLikelyToChange
          ? this.memory.existingTypeScriptFilesLikelyToChange.join("\n")
          : "(none listed)"
      }
      </TypescriptFilesThatAreLikelyToChange>

      ${
        !hasCompletedFiles
          ? `<ContentOfFilesThatMightChange>
              ${this.likelyToChangeFilesContents || ""}
            </ContentOfFilesThatMightChange>`
          : ``
      }

      ${
        hasCompletedFiles
          ? `<CodeFilesYouHaveAlreadyCompletedWorkOn>
               ${this.getCompletedFileContent()}
             </CodeFilesYouHaveAlreadyCompletedWorkOn>`
          : ``
      }

    ${this.renderProjectDescription()}
`;
  }

  renderProjectDescription() {
    return `<ProjectInstructions>
        ${
          this.memory.taskTitle
            ? `<ProjectTitle>${this.memory.taskTitle}</ProjectTitle>`
            : ``
        }

        ${
          this.memory.taskDescription
            ? `<OverallProjectDescription>${this.memory.taskDescription}</OverallProjectDescription>`
            : ``
        }

        ${
          this.memory.taskInstructions
            ? `<OverallTaskInstructions>${this.memory.taskInstructions}</OverallTaskInstructions>`
            : ``
        }
    </ProjectInstructions>`;
  }

  renderOriginalFiles() {
    if (
      !this.memory.currentTask ||
      !this.memory.currentTask.originalFiles ||
      this.memory.currentTask.originalFiles.length === 0
    ) {
      return ``;
    }
    return `
    <OriginalCodefilesBeforeYourChanges>
      ${this.memory.currentTask.originalFiles
        .map((f) => `${f.fileName}:\n${f.content}\n`)
        .join("\n")}
    </OriginalCodefilesBeforeYourChanges>
    `;
  }

  loadFileContents(fileName: string) {
    try {
      const content = fs.readFileSync(fileName, "utf-8");
      return content;
    } catch (error) {
      console.error(`Error reading file ${fileName}: ${error}`);
      return null;
    }
  }

  getFileContentsWithFileName(fileNames: string[], xmlTagName: string): string {
    return fileNames
      .map((fileName) => {
        const fileContent = this.loadFileContents(fileName);
        if (fileContent) {
          return `<${xmlTagName} filename="${fileName}">\n${fileContent}</${xmlTagName}>`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");
  }

  /**
   * Example usage of the new callModel approach if you need to invoke the LLM:
   */
  async exampleModelCall(sampleUserInput: string): Promise<string> {
    const systemPrompt = "You are a helpful assistant that writes code.";
    const userPrompt = `User's question or request: ${sampleUserInput}`;

    const messages = [
      this.createSystemMessage(systemPrompt),
      this.createHumanMessage(userPrompt),
    ];

    try {
      // This calls the LLM using the new approach.
      const response = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Small,
        messages,
        true // can stream or not based on your preference
      );

      if (typeof response === "string") {
        return response;
      } else {
        // If you parse JSON or arrays, handle that here.
        return JSON.stringify(response, null, 2);
      }
    } catch (error: any) {
      console.error(`Error calling the model: ${error.message}`);
      return "Error in LLM call.";
    }
  }
}
