import fs from "fs";
import { PsEngineerAgentBase } from "../agentBase.js";
/**
 * Extend PolicySynthAgent instead of the older PolicySynthScAgentBase,
 * but keep all your existing functionality and method logic.
 */
export class PsEngineerBaseProgrammingAgent extends PsEngineerAgentBase {
    documentationFilesInContextContent;
    currentFileContents;
    likelyToChangeFilesContents;
    typeDefFilesToKeepInContextContent;
    codeFilesToKeepInContextContent;
    maxRetries = 20;
    currentErrors;
    previousCurrentErrors;
    tsMorphProject;
    get maxModelTokensOut() {
        return 80000;
    }
    get modelTemperature() {
        return 0.0;
    }
    get reasoningEffort() {
        return "high";
    }
    /**
     * Adapted constructor: now uses PolicySynthAgent’s constructor signature.
     */
    constructor(agent, memory, startProgress = 0, endProgress = 100, { typeDefFilesToKeepInContextContent, codeFilesToKeepInContextContent, documentationFilesInContextContent, likelyToChangeFilesContents, tsMorphProject, }) {
        super(agent, memory, startProgress, endProgress);
        this.typeDefFilesToKeepInContextContent =
            typeDefFilesToKeepInContextContent;
        this.codeFilesToKeepInContextContent = codeFilesToKeepInContextContent;
        this.documentationFilesInContextContent =
            documentationFilesInContextContent;
        this.likelyToChangeFilesContents = likelyToChangeFilesContents;
        this.tsMorphProject = tsMorphProject;
    }
    updateMemoryWithFileContents(fileName, content) {
        if (!this.memory.currentTask) {
            this.memory.currentTask = { filesCompleted: [] };
        }
        if (!this.memory.currentTask.filesCompleted) {
            this.memory.currentTask.filesCompleted = [];
        }
        const existingFileIndex = this.memory.currentTask.filesCompleted.findIndex((f) => f.fileName === fileName);
        if (existingFileIndex > -1) {
            this.memory.currentTask.filesCompleted[existingFileIndex].content =
                content;
        }
        else {
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
      Avoid using the typescript defintion "any", use Typescript types whereever possible.
      Change the code as little as possible, use existing code and functions whenever possible.
      Always output the full new or changed typescript file, if you are changing a file do not leave anything out from the original file, otherwise code will get lost.
    </ImportantCodingRulesForYourCodeGeneration>`;
    }
    setOriginalFileIfNeeded(fileName, content) {
        if (!this.memory.currentTask) {
            this.memory.currentTask = { filesCompleted: [] };
        }
        if (!this.memory.currentTask.originalFiles) {
            this.memory.currentTask.originalFiles = [];
        }
        const existingFileIndex = this.memory.currentTask.originalFiles.findIndex((f) => f.fileName === fileName);
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
                .currentTask.filesCompleted.map((f) => `<FileYouHaveCompletedWorkOn filename="${f.fileName}">\n${f.content}\n</FileYouHaveCompletedWorkOn>`)
                .join("\n");
        }
        else {
            // Write out the files with line numbers to help fix errors
            return this.memory.currentTask.filesCompleted.map((f) => {
                const lines = f.content.split("\n");
                return `${f.fileName}:\n${lines
                    .map((line, index) => `${index + 1}: ${line}`)
                    .join("\n")}\n`;
            });
        }
    }
    setCurrentErrors(errors) {
        if (this.currentErrors) {
            this.previousCurrentErrors = this.currentErrors;
        }
        this.currentErrors = errors;
    }
    renderCurrentErrorsAndOriginalFiles() {
        const originalPlan = this.memory.allCodingPlans && this.memory.allCodingPlans.length > 0
            ? this.memory.allCodingPlans[0]
            : undefined;
        return `${this.currentErrors
            ? `${originalPlan
                ? `<YourOriginalPlan>${originalPlan}</YourOriginalPlan>`
                : ``}
        ${this.renderOriginalFiles()}\n<CurrentErrorsToFixInYourPlan>${this.currentErrors}</CurrentErrorsToFixInYourPlan>`
            : ``}${this.previousCurrentErrors
            ? `\n<PreviousErrorsYouWereTryingToFix>${this.previousCurrentErrors}</PreviousErrorsYouWereTryingToFix>`
            : ``}`;
    }
    removeWorkspacePathFromFileIfNeeded(filePath) {
        return filePath.replace(this.memory.workspaceFolder, "");
    }
    renderDefaultTaskAndContext(limited = false) {
        const hasContextFromSearch = (this.memory.exampleContextItems &&
            this.memory.exampleContextItems.length > 0) ||
            (this.memory.docsContextItems && this.memory.docsContextItems.length > 0);
        let hasCompletedFiles = false;
        if (this.memory.currentTask &&
            this.memory.currentTask.filesCompleted &&
            this.memory.currentTask.filesCompleted.length > 0) {
            hasCompletedFiles = true;
        }
        return `${false && hasContextFromSearch //TODO: Make examples work the other way
            ? `<ContextFromOnlineSearch>${this.memory.exampleContextItems &&
                this.memory.exampleContextItems.length > 0
                ? `Potentially relevant code examples from web search:
          ${this.memory.exampleContextItems.join("\n")}`
                : ``}
          ${this.memory.docsContextItems &&
                this.memory.docsContextItems.length > 0
                ? `\nPotentially relevant documentation from a web search:
          ${this.memory.docsContextItems.join("\n")}`
                : ``}
        </ContextFromOnlineSearch>`
            : ``}

      ${this.documentationFilesInContextContent &&
            this.documentationFilesInContextContent.length > 0 &&
            !limited
            ? `${this.documentationFilesInContextContent}`
            : ``}

      ${this.typeDefFilesToKeepInContextContent
            ? `${this.typeDefFilesToKeepInContextContent}`
            : ``}

      ${this.codeFilesToKeepInContextContent
            ? `${this.codeFilesToKeepInContextContent}`
            : ``}


      ${this.memory.existingTypeScriptFilesLikelyToChange && !limited
            ? `<TypescriptFilesThatCouldChangeIfNeeded>${this.memory.existingTypeScriptFilesLikelyToChange.join("\n")}</TypescriptFilesThatCouldChangeIfNeeded>`
            : ""}


      ${!hasCompletedFiles && !limited
            ? ` ${this.likelyToChangeFilesContents || ""}`
            : ``}

      ${hasCompletedFiles
            ? `<CodeFilesYouHaveAlreadyCompletedWorkOn>
               ${this.getCompletedFileContent()}
             </CodeFilesYouHaveAlreadyCompletedWorkOn>`
            : ``}

    ${this.renderProjectDescription()}
`;
    }
    renderProjectDescription() {
        return `<ProjectInstructions>
        ${this.memory.taskTitle
            ? `<ProjectTitle>${this.memory.taskTitle}</ProjectTitle>`
            : ``}

        ${this.memory.taskDescription
            ? `<OverallProjectDescription>${this.memory.taskDescription}</OverallProjectDescription>`
            : ``}

        ${this.memory.taskInstructions
            ? `<OverallTaskInstructions>${this.memory.taskInstructions}</OverallTaskInstructions>`
            : ``}
    </ProjectInstructions>`;
    }
    renderOriginalFiles() {
        if (!this.memory.currentTask ||
            !this.memory.currentTask.originalFiles ||
            this.memory.currentTask.originalFiles.length === 0) {
            return ``;
        }
        return `
    <OriginalCodefilesBeforeYourChanges>
      ${this.memory.currentTask.originalFiles
            .map((f) => `<OriginalFile filename="${f.fileName}">\n${f.content}\n</OriginalFile>`)
            .join("\n")}
    </OriginalCodefilesBeforeYourChanges>
    `;
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
    getFileContentsWithFileName(results, xmlTagName) {
        return results
            .map((result) => {
            const fileContent = this.loadFileContents(result.filePath);
            if (fileContent) {
                return `<${xmlTagName} filename="${result.filePath}">\n
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
//# sourceMappingURL=baseAgent.js.map