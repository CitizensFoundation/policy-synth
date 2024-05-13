import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsEngineerInitialAnalyzer } from "./analyze/initialAnalyzer.js";
import { PsEngineerExamplesWebResearchAgent } from "./webResearch/examplesWebResearch.js";
import { PsEngineerDocsWebResearchAgent } from "./webResearch/documentationWebResearch.js";
import { PsEngineerProgrammingAgent } from "./programming/programmingAgent.js";
import fs from "fs";
import path from "path";
import strip from "strip-comments";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

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
      taskDescription: `Create LLM classes for OpenAI, Claude Opus and Google Gemini, with a design that allows easy addition of other models in the future. This is a typescript based es module NodeJS modern server application.`,
      taskInstructions: `1. Create a new base chat class src/models/baseChatModel.ts in a new file.
      2. Then create src/models/openAiChat.ts, src/models/claudeOpusChat.ts and src/models/googleGeminiChat.ts for chat only
      3. For the cloudeOpus use the @anthropic-ai/sdk npm
      4. For the googleGemini use the @google/generative-ai npm
      5. For the openAi use the openai npm
      6. The baseChatModel and the child classes should only implement those two methods:
         generate([{role:string,message:string}], streaming: boolean | undefined, streamingCallback: Function | undefined)
         getNumTokensFromMessages([{role:string,message:string}])
      `,
      stages: PSEngineerAgent.emptyDefaultStages,
      docsSiteToScan: [
        "https://ai.google.dev/gemini-api/docs/get-started/node",
        "https://www.npmjs.com/package/openai",
        "https://www.reconify.com/docs/anthropic/node",
        "https://www.npmjs.com/package/@google/generative-ai",
        "https://www.npmjs.com/package/@anthropic-ai/sdk?activeTab=readme",
      ],
    } as unknown as PsEngineerMemoryData;
    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 4000,
      modelName: "gpt-4o",
      verbose: true,
    });

  }

  removeCommentsFromCode(code: string) {
    return strip(code);
  }

  removeWorkspacePathFromFileIfNeeded(filePath: string) {
    return filePath.replace(this.memory.workspaceFolder, "");
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

    const readDtsFilesRecursively = async (directory: string) => {
      try {
        const entries = fs.readdirSync(directory, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(directory, entry.name);
          if (entry.isDirectory()) {
            // Recursively read nested directories
            await readDtsFilesRecursively(fullPath);
          } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
            // Add file to list if it's a .d.ts file
            dtsFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${directory}: ${error}`);
      }
    };

    const searchPackages = async () => {
      if (
        this.memory.likelyRelevantNpmPackageDependencies &&
        this.memory.likelyRelevantNpmPackageDependencies.length > 0
      ) {
        for (const packageName of this.memory
          .likelyRelevantNpmPackageDependencies) {
          const packagePath = path.join(
            this.memory.workspaceFolder,
            "node_modules",
            packageName
          );
          await readDtsFilesRecursively(packagePath);
        }
      } else {
        this.logger.warn("No npm packages to search .d.ts files");
      }
    };

    await searchPackages();

    // Call LLM to filter relevant .d.ts files
    const relevantDtsFiles = await this.filterRelevantDtsFiles(dtsFiles);

    return relevantDtsFiles;
  }

  async filterRelevantDtsFiles(dtsFiles: string[]): Promise<string[]> {
    const prompt = `You are an expert software engineering analyzer. You will receive a list of .d.ts files. Please identify which files are likely to be relevant for the current task.

Only output a JSON array with file nothing else, no explainations before or after the JSON string[].

Task title: ${this.memory.taskTitle}
Task description: ${this.memory.taskDescription}
Task instructions: ${this.memory.taskInstructions}

List of .d.ts files:
${dtsFiles.join("\n")}

Please return a JSON array of the relevant file paths:`;

    const relevantFiles = await this.callLLM(
      "engineering-agent",
      IEngineConstants.engineerModel,
      [new SystemMessage(prompt)],
      true
    ) as string[];

    try {
      console.log(JSON.stringify(relevantFiles, null, 2));
      return relevantFiles;
    } catch (error) {
      console.error("Error parsing LLM response:", error);
      return [];
    }
  }

  async run() {
    this.memory.allTypescriptSrcFiles = await this.readAllTypescriptFileNames(
      this.memory.workspaceFolder
    );

    //TODO: Get .d.ts file for npms also likely to be relevant from the nodes_modules folder
    this.memory.allTypeDefsContents = this.memory.allTypescriptSrcFiles
      .map((filePath) => {
        if (filePath.endsWith(".d.ts")) {
          const content = this.removeCommentsFromCode(
            this.loadFileContents(filePath) || ""
          );
          if (content && content.length > 75) {
            return `\n${this.removeWorkspacePathFromFileIfNeeded(
              filePath
            )}:\n${content}`;
          } else {
            return null;
          }
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");

    this.memory.allTypeDefsContents = `<AllProjectTypescriptDefs>\n${this.memory.allTypeDefsContents}\n</AllProjectTypescriptDefs>`;

    //console.log(`All typescript defs: ${this.memory.allTypeDefsContents}`)

    const analyzeAgent = new PsEngineerInitialAnalyzer(this.memory);
    await analyzeAgent.analyzeAndSetup();

    const nodeModuleTypeDefs = await this.searchDtsFilesInNodeModules();

    if (nodeModuleTypeDefs.length > 0) {
      this.memory.allTypeDefsContents += `<AllRelevantNodeModuleTypescriptDefs>\n${nodeModuleTypeDefs
        .map((filePath) => {
          const content = this.removeCommentsFromCode(
            this.loadFileContents(filePath) || ""
          );
          if (content && content.length > 75) {
            return `\n${this.removeWorkspacePathFromFileIfNeeded(
              filePath
            )}:\n${content}`;
          } else {
            return null;
          }
        })
        .filter(Boolean)
        .join("\n")}\n</AllRelevantNodeModuleTypescriptDefs>`;
    } else {
      this.logger.warn("No .d.ts files found in node_modules");
      process.exit(1);
    }

    this.logger.info(`All TYPEDEFS ${this.memory.allTypeDefsContents}`);

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
