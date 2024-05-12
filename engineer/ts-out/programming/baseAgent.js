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
    maxRetries = 7;
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
    renderDefaultTaskAndContext() {
        return `<Task>
        Overall task title:
        ${this.memory.taskTitle}

        Overall task description:
        ${this.memory.taskDescription}

        Overall task instructions:
        ${this.memory.taskInstructions}
      </Task>

      <Context>
        Typescript file that might have to change:
        ${this.memory.typeScriptFilesLikelyToChange.join("\n")}

        ${this.documentationFilesInContextContent
            ? `Local documentation:\n${this.documentationFilesInContextContent}`
            : ``}

        <ContentOfFilesThatMightChange>
          ${this.likelyToChangeFilesContents}
        </ContentOfFilesThatMightChange>

      </Context>`;
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
            return `${fileName}\n${fileContent}`;
        })
            .join("\n");
    }
}
//# sourceMappingURL=baseAgent.js.map