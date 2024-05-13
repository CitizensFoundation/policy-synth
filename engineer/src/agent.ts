import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { PsEngineerInitialAnalyzer } from "./analyze/initialAnalyzer.js";
import { PsEngineerExamplesWebResearchAgent } from "./webResearch/examplesWebResearch.js";
import { PsEngineerDocsWebResearchAgent } from "./webResearch/documentationWebResearch.js";
import { PsEngineerProgrammingAgent } from "./programming/programmingAgent.js";
import fs from "fs";
import path from "path";

export class PSEngineerAgent extends PolicySynthAgentBase {
  override memory: PsEngineerMemoryData;

  constructor() {
    super();
    this.memory = {
      actionLog: [],
      workspaceFolder:
        "/home/robert/Scratch/policy-synth-engineer-tests/agents",
      taskTitle:
        "Integrate LLM Abstractions for Claude Opus and Google Gemini into Base Agent Class",
      taskDescription:
        "Our current system utilizes LangChain TS for modeling abstraction and is configured to support OpenAI's models, accessible both directly and through Azure. The goal is to expand this capability by integrating abstractions for Claude Opus and Google Gemini, with a design that allows easy addition of other models in the future. This is a typescript based es module NodeJS modern server application.",
      taskInstructions: `1. Create a new base chat class policy synth model in src/models/baseModel.ts
      2. Then create src/models/openAi.ts, src/models/claudeOpus.ts and src/models/googleGemini.ts
      3. For the cloudeOpus use the @langchain/anthropic npm
      4. For the googleGemini use the @google/generative-ai npm
      5. For the new src/models/openAi.ts use langchain/openai as we do currently
      6. Then in the baseAgent.ts refactor it so it uses the models from the src/models class
      7. In callLLM add an optional option for setting the model type to one of those three, then use that. But make sure to default to openAi so we don't need to change any code that uses callLLM`,
      stages: PSEngineerAgent.emptyDefaultStages,
      docsSiteToScan: [
        "https://ai.google.dev/gemini-api/docs/get-started/node",
        "https://www.npmjs.com/package/@google/generative-ai",
        "https://www.npmjs.com/package/@langchain/anthropic",
        "https://js.langchain.com/docs/modules/model_io/chat/quick_start"
      ],
    } as unknown as PsEngineerMemoryData;
  }

  async doWebResearch() {
    const exampleResearcher = new PsEngineerExamplesWebResearchAgent(
      this.memory
    );
    const docsResearcher = new PsEngineerDocsWebResearchAgent(this.memory);

    const [exampleContextItems, docsContextItems] = await Promise.all([
      exampleResearcher.doWebResearch() as Promise<string[]>,
      docsResearcher.doWebResearch() as Promise<string[]>,
    ]);

    this.memory.exampleContextItems = exampleContextItems;
    this.memory.docsContextItems = docsContextItems;

    this.memory.actionLog.push("Web research completed");
  }

  async readAllTypescriptFileNames(folderPath: string): Promise<string[]> {
    const files = fs.readdirSync(folderPath);

    const allFiles: string[] = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory() && file !== "ts-out" && file !== "node_modules") {
        const subFiles = await this.readAllTypescriptFileNames(filePath);
        allFiles.push(...subFiles);
      } else if (path.extname(file) === ".ts") {
        allFiles.push(filePath);
      }
    }

    return allFiles;
  }

  async run() {
    this.memory.allTypescriptSrcFiles = await this.readAllTypescriptFileNames(
      this.memory.workspaceFolder
    );

    //TODO: Get .d.ts file for npms also likely to be relevant from the nodes_modules folder
    this.memory.allTypeDefsContents = this.memory.allTypescriptSrcFiles
      .map((filePath) => {
        if (filePath.endsWith(".d.ts")) {
          const content = this.loadFileContents(filePath);
          return `${path.basename(filePath)}\n${content}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");

    //console.log(`All typescript defs: ${this.memory.allTypeDefsContents}`)

    const analyzeAgent = new PsEngineerInitialAnalyzer(this.memory);
    await analyzeAgent.analyzeAndSetup();

    if (this.memory.needsDocumentionsAndExamples === true) {
      await this.doWebResearch();
    }

    const programmer = new PsEngineerProgrammingAgent(this.memory);
    await programmer.implementTask();
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
