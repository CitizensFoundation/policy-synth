import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";
import fs from "fs";
export class PsEngineerBaseProgrammingAgent extends PolicySynthAgentBase {
    memory;
    otherFilesToKeepInContextContent;
    documentationFilesInContextContent;
    currentFileContents;
    likelyToChangeFilesContents;
    maxRetries = 27;
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
            maxTokens: 4000,
            modelName: IEngineConstants.engineerModel.name,
            verbose: false,
        });
    }
    updateMemoryWithFileContents(fileName, content) {
        if (!this.memory.currentTask)
            this.memory.currentTask = { filesCompleted: [] };
        if (!this.memory.currentTask.filesCompleted)
            this.memory.currentTask.filesCompleted = [];
        const existingFileIndex = this.memory.currentTask.filesCompleted.findIndex((f) => f.fileName === fileName);
        if (existingFileIndex > -1) {
            this.memory.currentTask.filesCompleted[existingFileIndex].content =
                content;
        }
        else {
            this.memory.currentTask.filesCompleted.push({
                fileName,
                content: content,
            });
        }
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
          ${this.memory.typeScriptFilesLikelyToChange.join("\n")}

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

          ${hasCompletedFiles
            ? `
          <CodeFilesYouHaveAlreadyCompleted>
            ${this.memory
                .currentTask.filesCompleted.map((f) => `${f.fileName}:\n${f.content}\n`)
                .join("\n")}
          </CodeFilesYouHaveAlreadyCompleted>
          `
            : ``}

        </Context>

        <Project>
          Overall project title:
          ${this.memory.taskTitle}

          Overall project description:
          ${this.memory.taskDescription}

          Overall project instructions:
          ${this.memory.taskInstructions}
        </Project>
`;
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