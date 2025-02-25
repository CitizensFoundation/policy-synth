import fs from "fs";
import { Project, ReturnTypedNode } from "ts-morph";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

import { PsEngineerAgentBase } from "../agentBase.js";


/* ------------------------------------------------------------------------
   Base Programming Agent
------------------------------------------------------------------------- */
export abstract class PsEngineerBaseProgrammingAgent extends PsEngineerAgentBase {
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
    return 64000;
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

  /**
   * A concise set of global constraints and guidelines that apply to all prompts.
   */
  renderGlobalConstraints(): string {
    return `<GlobalConstraints>
1. Only create or modify TypeScript (.ts) files. No other file types.
2. Never generate documentation tasks, those are handled separately.
3. Keep changes minimal and targeted to known errors or explicit tasks.
4. Never import .d.ts types; they are automatically accessible.
</GlobalConstraints>`;
  }

  /**
   * Additional coding guidelines that also appear in the original code.
   */
  renderCodingRules() {
    return `<ImportantCodingRulesForYourCodeGeneration>
      Always export all classes at the front of the file like "export class" or "export abstract class", never at the bottom of the file.
      Never generate import statements in TypeScript declaration files (*.d.ts) — types there are global by default.
      Never generate export statements for interfaces in TypeScript declaration files (*.d.ts files).
      Avoid using the typescript definition "any", use Typescript types wherever possible.
      Change the code as little as possible, use existing code and functions whenever possible.
      Always output the full new or changed typescript file, if you are changing a file do not leave anything out from the original file, otherwise code will get lost.
    </ImportantCodingRulesForYourCodeGeneration>`;
  }

  /**
   * Success Criteria for different phases of the conversation:
   *   - plan: A bullet-point plan (no actual code).
   *   - review: Checking the plan for correctness or needed fixes.
   *   - actionPlan: Output a JSON array specifying file changes.
   *   - actionReview: Checking the action plan for correctness or needed fixes.
   */
  renderSuccessCriteria(
    context: "plan" | "review" | "actionPlan" | "actionReview"
  ): string {
    if (context === "plan") {
      return `<SuccessCriteria>
1. Provide a concise bullet-point plan for required changes.
2. Do not include actual code—only a high-level approach.
3. Focus on any known errors if relevant, do not fix unrelated items.
</SuccessCriteria>`;
    } else if (context === "review") {
      return `<SuccessCriteria>
1. Check if the plan addresses known errors and follows global constraints.
2. Output "Coding plan looks good" if acceptable, or provide brief corrections otherwise.
</SuccessCriteria>`;
    } else if (context === "actionPlan") {
      return `<SuccessCriteria>
1. Output a JSON array specifying the changes (add, change, or delete).
2. Summarize the plan tasks in each item (codingTaskTitle, codingTaskSteps).
3. Keep changes minimal and address only known errors or explicit tasks.
</SuccessCriteria>`;
    } else if (context === "actionReview") {
      return `<SuccessCriteria>
1. Output "Action plan looks good" if it meets constraints, or provide corrections otherwise.
2. Double-check it addresses known errors and matches the final plan.
</SuccessCriteria>`;
    }
    return `<SuccessCriteria></SuccessCriteria>`;
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
          (f) =>
            `<FileYouHaveCompletedWorkOn filename="${f.fileName}">\n${f.content}\n</FileYouHaveCompletedWorkOn>`
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
    const originalPlan =
      this.memory.allCodingPlans && this.memory.allCodingPlans.length > 0
        ? this.memory.allCodingPlans[0]
        : undefined;
    return `${
      this.currentErrors
        ? `${
            originalPlan
              ? `<YourOriginalPlan>${originalPlan}</YourOriginalPlan>`
              : ``
          }
        ${this.renderOriginalFiles()}
        <CurrentErrorsToFixInYourPlan>${
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

  renderDefaultTaskAndContext(limited = false) {
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

    return `
      ${
        hasContextFromSearch && false // historically set to false
          ? `<ContextFromOnlineSearch>${
              this.memory.exampleContextItems &&
              this.memory.exampleContextItems!.length > 0
                ? `Potentially relevant code examples from web search:
          ${this.memory.exampleContextItems!.join("\n")}`
                : ``
            }
          ${
            this.memory.docsContextItems &&
            this.memory.docsContextItems!.length > 0
              ? `\nPotentially relevant documentation from a web search:
          ${this.memory.docsContextItems!.join("\n")}`
              : ``
          }
        </ContextFromOnlineSearch>`
          : ``
      }

      ${
        this.documentationFilesInContextContent &&
        this.documentationFilesInContextContent.length > 0 &&
        !limited
          ? `${this.documentationFilesInContextContent}`
          : ``
      }

      ${
        this.typeDefFilesToKeepInContextContent
          ? `${this.typeDefFilesToKeepInContextContent}`
          : ``
      }

      ${
        this.codeFilesToKeepInContextContent
          ? `${this.codeFilesToKeepInContextContent}`
          : ``
      }

      ${
        this.memory.existingTypeScriptFilesLikelyToChange && !limited
          ? `<TypescriptFilesThatCouldChangeIfNeeded>${this.memory.existingTypeScriptFilesLikelyToChange.join(
              "\n"
            )}</TypescriptFilesThatCouldChangeIfNeeded>`
          : ""
      }

      ${
        !hasCompletedFiles && !limited
          ? ` ${this.likelyToChangeFilesContents || ""}`
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
        .map(
          (f) =>
            `<OriginalFile filename="${f.fileName}">\n${f.content}\n</OriginalFile>`
        )
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

  getFileContentsWithFileName(
    results: PsCodeAnalyzeResults[],
    xmlTagName: string
  ): string {
    return results
      .map((result) => {
        const fileContent = this.loadFileContents(result.filePath);
        if (fileContent) {
          return `<${xmlTagName} filename="${result.filePath}">
            <AnalysisOnHowItMightBeRelevant>${result.detailedCodeAnalysisForRelevanceToTask}</AnalysisOnHowItMightBeRelevant>
            <Code>${fileContent}</Code>
          </${xmlTagName}>`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");
  }
}
