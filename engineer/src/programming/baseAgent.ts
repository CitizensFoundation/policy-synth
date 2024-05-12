import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";

import { Project } from "ts-morph";

import fs from "fs";

export abstract class PsEngineerBaseProgrammingAgent extends PolicySynthAgentBase {
  override memory: PsEngineerMemoryData;
  otherFilesToKeepInContextContent?: string;
  documentationFilesInContextContent?: string;
  currentFileContents: string | undefined | null;
  otherLikelyToChangeFilesContents: string | undefined | null;
  maxRetries = 7;

  tsMorphProject: Project | undefined;

  constructor(memory: PsEngineerMemoryData) {
    super(memory);
    this.memory = memory;
    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 4000,
      modelName: IEngineConstants.engineerModel.name,
      verbose: false,
    });
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
}
