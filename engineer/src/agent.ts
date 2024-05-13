import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
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
        "Create LLM Abstractions for OpenAI, Claude Opus and Google Gemini with a common base class",
      taskDescription: `Our current system utilizes LangChain TS for modeling abstraction and is configured to support OpenAI's models, accessible both directly and through Azure.
        The goal is to expand this capability by integrating abstractions for Claude Opus and Google Gemini, with a design that allows easy addition of other models in the future. This is a typescript based es module NodeJS modern server application.`,
      taskInstructions: `1. Create a new base chat class src/models/baseModel.ts that has the same API as ChatOpenAI, this is a new file.
      2. Then create src/models/openAi.ts, src/models/claudeOpus.ts and src/models/googleGemini.ts
      3. For the cloudeOpus use the @langchain/anthropic npm
      4. For the googleGemini use the @google/generative-ai npm
      5. For the new src/models/openAi.ts use langchain/openai as we do currently
      6. Do nothing else for now, just create the files and classes with the same API as ChatOpenAI API
      `,
      stages: PSEngineerAgent.emptyDefaultStages,
      docsSiteToScan: [
        "https://ai.google.dev/gemini-api/docs/get-started/node",
        "https://www.npmjs.com/package/@google/generative-ai",
        "https://www.npmjs.com/package/@langchain/anthropic",
        "https://js.langchain.com/docs/integrations/chat/openai",
        "https://js.langchain.com/docs/modules/model_io/chat/quick_start",
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

  async searchDtsFilesInNodeModules(): Promise<string[]> {
    const dtsFiles: string[] = [];

    for (const packageName of this.memory
      .likelyRelevantNpmPackageDependencies) {
      const packagePath = path.join(
        this.memory.workspaceFolder,
        "node_modules",
        packageName
      );

      try {
        const files = fs.readdirSync(packagePath, { withFileTypes: true });

        for (const file of files) {
          if (file.isFile() && file.name.endsWith(".d.ts")) {
            const filePath = path.join(packagePath, file.name);
            dtsFiles.push(filePath);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${packagePath}: ${error}`);
      }
    }

    return dtsFiles;
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
          return `${path.basename(filePath)}:\n${content}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");

    this.memory.allTypeDefsContents = `<AllProjectTypescriptDefs>\n${this.memory.allTypeDefsContents}\n</AllProjectTypescriptDefs>`;
    const nodeModuleTypeDefs = await this.searchDtsFilesInNodeModules();

    if (nodeModuleTypeDefs.length > 0) {
      this.memory.allTypeDefsContents += `<AllNodeModuleTypescriptDefs>\n${nodeModuleTypeDefs
        .map((filePath) => {
          const content = this.loadFileContents(filePath);
          return `${path.basename(filePath)}:\n${content}`;
        })
        .join("\n")}\n</AllNodeModuleTypescriptDefs>`;
    }

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
