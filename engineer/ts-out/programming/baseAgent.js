import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";
import fs from "fs";
export class PsEngineerBaseProgrammingAgent extends PolicySynthAgentBase {
    memory;
    otherFilesToKeepInContextContent;
    documentationFilesInContextContent;
    currentFileContents;
    otherLikelyToChangeFilesContents;
    maxRetries = 7;
    tsMorphProject;
    constructor(memory) {
        super(memory);
        this.memory = memory;
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4000,
            modelName: IEngineConstants.engineerModel.name,
            verbose: false,
        });
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
}
//# sourceMappingURL=baseAgent.js.map