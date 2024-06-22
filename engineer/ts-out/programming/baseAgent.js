import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import fs from "fs";
export class PsEngineerBaseProgrammingAgent extends PolicySynthScAgentBase {
    memory;
    otherFilesToKeepInContextContent;
    documentationFilesInContextContent;
    currentFileContents;
    likelyToChangeFilesContents;
    maxRetries = 72;
    currentErrors;
    previousCurrentErrors;
    tsMorphProject;
    constructor(memory, likelyToChangeFilesContents = undefined, otherFilesToKeepInContextContent = undefined, documentationFilesInContextContent = undefined, tsMorphProject = undefined) {
        super(memory);
        this.likelyToChangeFilesContents = likelyToChangeFilesContents;
        this.otherFilesToKeepInContextContent = otherFilesToKeepInContextContent;
        this.documentationFilesInContextContent =
            documentationFilesInContextContent;
        this.tsMorphProject = tsMorphProject;
        this.memory = memory;
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4096,
            modelName: "gpt-4o",
            verbose: false,
        });
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
        // Ensure the first two files and the last two files are always kept
        const filesCompleted = this.memory.currentTask.filesCompleted;
        if (filesCompleted.length > 5) {
            // Keep the first two files and the last three files
            const firstTwoFiles = filesCompleted.slice(0, 2);
            const lastTwoFiles = filesCompleted.slice(-3);
            this.memory.currentTask.filesCompleted = [
                ...firstTwoFiles,
                ...lastTwoFiles,
            ];
        }
    }
    renderCodingRules() {
        return `<ImportantCodingRulesForYourCodeGeneration>
      Always export all classes at the front of the file like "export class" or "export abstract class", never at the bottom of the file.
      Never generate import statements typescript type declarations files the *.d.ts files are global by default.
      Never generate export statements for interfaces in typescript declaration files (*.d.ts files).
    </ImportantCodingRulesForYourCodeGeneration>`;
    }
    setOriginalFileIfNeeded(fileName, content) {
        if (!this.memory.currentTask)
            this.memory.currentTask = { filesCompleted: [] };
        if (!this.memory.currentTask.originalFiles)
            this.memory.currentTask.originalFiles = [];
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
            this.memory
                .currentTask.filesCompleted.map((f) => `${f.fileName}:\n${f.content}\n`)
                .join("\n");
        }
        else {
            // Write out the files with line numbers
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
        return `${this.currentErrors
            ? `${this.renderOriginalFiles()}\n<CurrentErrorsToFixInYourPlan>${this.currentErrors}</CurrentErrorsToFixInYourPlan>`
            : ``}${this.previousCurrentErrors
            ? `\n<PreviousErrorsYouWereTryingToFix>${this.previousCurrentErrors}</PreviousErrorsYouWereTryingToFix>`
            : ``}`;
    }
    removeWorkspacePathFromFileIfNeeded(filePath) {
        return filePath.replace(this.memory.workspaceFolder, "");
    }
    renderDefaultTaskAndContext() {
        const hasContextFromSearch = this.memory.exampleContextItems || this.memory.docsContextItems;
        let hasCompletedFiles = false;
        if (this.memory.currentTask &&
            this.memory.currentTask.filesCompleted &&
            this.memory.currentTask.filesCompleted.length > 0) {
            hasCompletedFiles = true;
        }
        return `${hasContextFromSearch
            ? `<ContextFromOnlineSearch>${this.memory.exampleContextItems &&
                this.memory.exampleContextItems.length > 0
                ? `Potentally relevant code examples from web search:
        ${this.memory.exampleContextItems.map((i) => i)}`
                : ``}
        ${this.memory.docsContextItems &&
                this.memory.docsContextItems.length > 0
                ? `Potentally relevant documentation from a web search:
        ${this.memory.docsContextItems.map((i) => i)}`
                : ``}</ContextFromOnlineSearch>`
            : ``}
        <Context>
          Typescript file that might have to change:
          ${this.memory.existingTypeScriptFilesLikelyToChange.join("\n")}

          ${this.documentationFilesInContextContent
            ? `Local documentation:\n${this.documentationFilesInContextContent}`
            : ``}

          All typedefs:
          ${this.memory.allTypeDefsContents}

          ${!hasCompletedFiles
            ? `<ContentOfFilesThatMightChange>
            ${this.likelyToChangeFilesContents}
          </ContentOfFilesThatMightChange>`
            : ``}

          ${this.otherFilesToKeepInContextContent
            ? `
           <OtherFilesPossiblyRelevant>
             ${this.otherFilesToKeepInContextContent}
           </OtherFilesPossiblyRelevant> `
            : ``}

          ${hasCompletedFiles
            ? `
          <CodeFilesYouHaveAlreadyCompleted>
            ${this.getCompletedFileContent()}
          </CodeFilesYouHaveAlreadyCompleted>
          `
            : ``}

        </Context>

        ${this.renderProjectDescription()}
`;
    }
    renderProjectDescription() {
        return `<ProjectInstructions>
      Overall project title:
      ${this.memory.taskTitle}

      Overall project description:
      ${this.memory.taskDescription}

      <OverAllTaskInstructions>:
        ${this.memory.taskInstructions}
      </OverAllTaskInstructions>:

    </ProjectInstructions>`;
    }
    renderOriginalFiles() {
        return `
    ${this.memory.currentTask &&
            this.memory.currentTask.originalFiles &&
            this.memory.currentTask.originalFiles.length > 0
            ? `
    <OriginalCodefilesBeforeYourChanges>
      ${this.memory.currentTask.originalFiles
                .map((f) => `${f.fileName}:\n${f.content}\n`)
                .join("\n")}
    </OriginalCodefilesBeforeYourChanges>
    `
            : ``}`;
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
    getFileContentsWithFileName(fileNames) {
        return fileNames
            .map((fileName) => {
            const fileContent = this.loadFileContents(fileName);
            if (fileContent) {
                return `${fileName}\n${fileContent}`;
            }
        })
            .filter(Boolean)
            .join("\n");
    }
}
//# sourceMappingURL=baseAgent.js.map