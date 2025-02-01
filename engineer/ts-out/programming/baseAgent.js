import fs from "fs";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
/**
 * Extend PolicySynthAgent instead of the older PolicySynthScAgentBase,
 * but keep all your existing functionality and method logic.
 */
export class PsEngineerBaseProgrammingAgent extends PolicySynthAgent {
    otherFilesToKeepInContextContent;
    documentationFilesInContextContent;
    currentFileContents;
    likelyToChangeFilesContents;
    maxRetries = 72;
    currentErrors;
    previousCurrentErrors;
    tsMorphProject;
    get maxModelTokensOut() {
        return 100000;
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
    constructor(agent, memory, startProgress = 0, endProgress = 100, otherFilesToKeepInContextContent, documentationFilesInContextContent, likelyToChangeFilesContents, tsMorphProject) {
        super(agent, memory, startProgress, endProgress);
        this.otherFilesToKeepInContextContent = otherFilesToKeepInContextContent;
        this.documentationFilesInContextContent = documentationFilesInContextContent;
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
                .currentTask.filesCompleted.map((f) => `${f.fileName}:\n${f.content}\n`)
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
        const hasContextFromSearch = (this.memory.exampleContextItems &&
            this.memory.exampleContextItems.length > 0) ||
            (this.memory.docsContextItems && this.memory.docsContextItems.length > 0);
        let hasCompletedFiles = false;
        if (this.memory.currentTask &&
            this.memory.currentTask.filesCompleted &&
            this.memory.currentTask.filesCompleted.length > 0) {
            hasCompletedFiles = true;
        }
        return `${hasContextFromSearch
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
    <Context>
      Typescript files that might have to change:
      ${this.memory.existingTypeScriptFilesLikelyToChange
            ? this.memory.existingTypeScriptFilesLikelyToChange.join("\n")
            : "(none listed)"}

      ${this.documentationFilesInContextContent
            ? `Local documentation:\n${this.documentationFilesInContextContent}`
            : ``}

      All typedefs:
      ${this.memory.allTypeDefsContents}

      ${!hasCompletedFiles
            ? `<ContentOfFilesThatMightChange>
              ${this.likelyToChangeFilesContents || ""}
            </ContentOfFilesThatMightChange>`
            : ``}

      ${this.otherFilesToKeepInContextContent
            ? `<OtherFilesPossiblyRelevant>
               ${this.otherFilesToKeepInContextContent}
             </OtherFilesPossiblyRelevant>`
            : ``}

      ${hasCompletedFiles
            ? `<CodeFilesYouHaveAlreadyCompleted>
               ${this.getCompletedFileContent()}
             </CodeFilesYouHaveAlreadyCompleted>`
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

      <OverAllTaskInstructions>
        ${this.memory.taskInstructions}
      </OverAllTaskInstructions>
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
            .map((f) => `${f.fileName}:\n${f.content}\n`)
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
    getFileContentsWithFileName(fileNames) {
        return fileNames
            .map((fileName) => {
            const fileContent = this.loadFileContents(fileName);
            if (fileContent) {
                return `${fileName}\n${fileContent}`;
            }
            return null;
        })
            .filter(Boolean)
            .join("\n");
    }
    /**
     * Example usage of the new callModel approach if you need to invoke the LLM:
     */
    async exampleModelCall(sampleUserInput) {
        const systemPrompt = "You are a helpful assistant that writes code.";
        const userPrompt = `User's question or request: ${sampleUserInput}`;
        const messages = [
            this.createSystemMessage(systemPrompt),
            this.createHumanMessage(userPrompt),
        ];
        try {
            // This calls the LLM using the new approach.
            const response = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, messages, true // can stream or not based on your preference
            );
            if (typeof response === "string") {
                return response;
            }
            else {
                // If you parse JSON or arrays, handle that here.
                return JSON.stringify(response, null, 2);
            }
        }
        catch (error) {
            console.error(`Error calling the model: ${error.message}`);
            return "Error in LLM call.";
        }
    }
}
//# sourceMappingURL=baseAgent.js.map