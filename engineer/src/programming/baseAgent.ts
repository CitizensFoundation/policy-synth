import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";

import { Project } from "ts-morph";

import fs from "fs";

export abstract class PsEngineerBaseProgrammingAgent extends PolicySynthAgentBase {
  override memory: PsEngineerMemoryData;
  otherFilesToKeepInContextContent: string | undefined | null;
  documentationFilesInContextContent: string | undefined | null;
  currentFileContents: string | undefined | null;
  likelyToChangeFilesContents: string | undefined | null;
  maxRetries = 27;

  tsMorphProject: Project | undefined;

  constructor(
    memory: PsEngineerMemoryData,
    likelyToChangeFilesContents: string | null | undefined = undefined,
    otherFilesToKeepInContextContent: string | null | undefined = undefined,
    documentationFilesInContextContent: string | null | undefined = undefined,
    tsMorphProject: Project | undefined = undefined
  ) {
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

  updateMemoryWithFileContents(fileName: string, content: string) {
    if (!this.memory.currentTask)
      this.memory.currentTask = { filesCompleted: [] };

    if (!this.memory.currentTask.filesCompleted)
      this.memory.currentTask.filesCompleted = [];

    const existingFileIndex = this.memory.currentTask.filesCompleted.findIndex(
      (f) => f.fileName === fileName
    );
    if (existingFileIndex > -1) {
      this.memory.currentTask.filesCompleted[existingFileIndex].content =
        content;
    } else {
      this.memory.currentTask.filesCompleted.push({
        fileName,
        content: content,
      });
    }
  }

  setOriginalFileIfNeeded(fileName: string, content: string) {
    if (!this.memory.currentTask)
      this.memory.currentTask = { filesCompleted: [] };

    if (!this.memory.currentTask.originalFiles)
      this.memory.currentTask.originalFiles = [];

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

  renderDefaultTaskAndContext() {
    const hasContextFromSearch =
      this.memory.exampleContextItems || this.memory.docsContextItems;

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
              ? `Potentally relevant code examples from web search:
        ${this.memory.exampleContextItems.map((i) => i)}`
              : ``
          }
        ${
          this.memory.docsContextItems &&
          this.memory.docsContextItems.length > 0
            ? `Potentally relevant documentation from a web search:
        ${this.memory.docsContextItems.map((i) => i)}`
            : ``
        }</ContextFromOnlineSearch>`
        : ``
    }
        <Context>
          Typescript file that might have to change:
          ${this.memory.typeScriptFilesLikelyToChange.join("\n")}

          ${
            this.documentationFilesInContextContent
              ? `Local documentation:\n${this.documentationFilesInContextContent}`
              : ``
          }

          All typedefs:
          ${this.memory.allTypeDefsContents}

          ${
            !hasCompletedFiles
              ? `<ContentOfFilesThatMightChange>
            ${this.likelyToChangeFilesContents}
          </ContentOfFilesThatMightChange>`
              : ``
          }

          ${
            hasCompletedFiles
              ? `
          <CodeFilesYouHaveAlreadyCompleted>
            ${this.memory
              .currentTask!.filesCompleted!.map(
                (f) => `${f.fileName}:\n${f.content}\n`
              )
              .join("\n")}
          </CodeFilesYouHaveAlreadyCompleted>
          `
              : ``
          }

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
    ${
      this.memory.currentTask &&
      this.memory.currentTask.originalFiles &&
      this.memory.currentTask.originalFiles.length > 0
        ? `
    <OriginalCodefilesBeforeYourChanges>
      ${this.memory.currentTask.originalFiles
        .map((f) => `${f.fileName}:\n${f.content}\n`)
        .join("\n")}
    </OriginalCodefilesBeforeYourChanges>
    `
        : ``
    }`;
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

  getFileContentsWithFileName(fileNames: string[]): string {
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
