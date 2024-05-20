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
import axios from "axios";

interface GitHubIssue {
  title: string;
  body: string;
}

export class PSEngineerAgent extends PolicySynthAgentBase {
  override memory: PsEngineerMemoryData;
  githubIssueUrl: string | undefined;

  constructor(githubIssueUrl: string | undefined = undefined) {
    super();
    this.githubIssueUrl = githubIssueUrl;
    this.memory = {
      actionLog: [],
      workspaceFolder:
        "/home/robert/Scratch/policy-synth-engineer-tests/agents",
      taskTitle: "Add a new LLM model class for OpenAI on Azure",
      taskDescription: `We want to add a new model class into src/models/azureOpenAiChat.ts using the @azure/openai npm module.`,
      taskInstructions: `1. Add a new model class in src/models/azureOpenAiChat.ts using the @azure/openai npm module based on src/models/baseChatModel.ts parent class.`,
      stages: PSEngineerAgent.emptyDefaultStages,
      docsSiteToScan: ["https://www.npmjs.com/package/@azure/openai"],
    } as unknown as PsEngineerMemoryData;
    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 4096,
      modelName: "gpt-4o",
      verbose: true,
    });

    if (this.githubIssueUrl) {
      this.fetchGitHubIssue(this.githubIssueUrl)
        .then((issue) => {
          const parsedDescription = this.parseIssueBody(issue.body);
          if (!parsedDescription) {
            throw new Error(
              "Failed to parse Task Description and Task Instructions from the issue body."
            );
          }

          this.memory.taskTitle = issue.title;
          this.memory.taskDescription = parsedDescription.taskDescription;
          this.memory.taskInstructions = parsedDescription.taskInstructions;
          console.log(
            `GitHub Issue Desc: ${parsedDescription.taskDescription}`
          );
          console.log(
            `GitHub Issue Task: ${parsedDescription.taskInstructions}`
          );
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }

  async initializeFromGitHubIssue() {
    if (this.githubIssueUrl) {
      const issue = await this.fetchGitHubIssue(this.githubIssueUrl);
      const parsedDescription = this.parseIssueBody(issue.body);
      if (!parsedDescription) {
        throw new Error(
          "Failed to parse Task Description and Task Instructions from the issue body."
        );
      }
      this.memory.taskTitle = issue.title;
      this.memory.taskDescription = parsedDescription.taskDescription;
      this.memory.taskInstructions = parsedDescription.taskInstructions;
      console.log(`GitHub Issue Title: ${issue.title}`);
      console.log(`GitHub Issue Desc: ${parsedDescription.taskDescription}`);
      console.log(`GitHub Issue Task: ${parsedDescription.taskInstructions}`);
    }
  }

  async fetchGitHubIssue(url: string): Promise<GitHubIssue> {
    try {
      // Convert the GitHub issue URL to the API endpoint
      const apiUrl = this.convertToApiUrl(url);
      const response = await axios.get(apiUrl);
      const issue: GitHubIssue = {
        title: response.data.title,
        body: response.data.body,
      };
      return issue;
    } catch (error: any) {
      throw new Error(`Failed to fetch issue: ${error.message}`);
    }
  }

  convertToApiUrl(issueUrl: string): string {
    const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
    const match = issueUrl.match(regex);
    if (!match) {
      throw new Error("Invalid GitHub issue URL");
    }
    const [, owner, repo, issueNumber] = match;
    return `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
  }

  parseIssueBody(
    body: string
  ): { taskDescription: string; taskInstructions: string } | null {
    const descriptionMatch = body.match(/\*Task Description\*\s*([^*]+)/s);
    const instructionsMatch = body.match(/\*Task Instructions\*\s*([^*]+)/s);

    if (descriptionMatch && instructionsMatch) {
      return {
        taskDescription: descriptionMatch[1].trim(),
        taskInstructions: instructionsMatch[1].trim(),
      };
    } else {
      return null;
    }
  }

  removeCommentsFromCode(code: string) {
    return strip(code);
  }

  removeWorkspacePathFromFileIfNeeded(filePath: string) {
    return filePath.replace(this.memory.workspaceFolder, "");
  }

  addWorkspacePathToFileIfNeeded(filePath: string) {
    return path.join(this.memory.workspaceFolder, filePath);
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
        console.log(`Reading directory: ${directory}`);
        for (const entry of entries) {
          const fullPath = path.join(directory, entry.name);
          if (entry.isDirectory()) {
            // Recursively read nested directories
            console.log(`Entering directory: ${fullPath}`);
            await readDtsFilesRecursively(fullPath);
          } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
            // Add file to list if it's a .d.ts file
            console.log(`Found .d.ts file: ${fullPath}`);
            dtsFiles.push(fullPath);
          } else {
            console.log(`Skipping: ${fullPath}`);
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
        console.log(
          `Searching packages: ${this.memory.likelyRelevantNpmPackageDependencies.join(
            ", "
          )}`
        );
        for (const packageName of this.memory
          .likelyRelevantNpmPackageDependencies) {
          const packagePath = path.join(
            this.memory.workspaceFolder,
            "node_modules",
            packageName
          );
          console.log(`Searching package: ${packagePath}`);
          await readDtsFilesRecursively(packagePath);
        }
      } else {
        this.logger.warn("No npm packages to search for .d.ts files");
      }
    };

    await searchPackages();

    // Call LLM to filter relevant .d.ts files
    console.log("Filtering relevant .d.ts files", dtsFiles);
    const relevantDtsFiles = await this.filterRelevantDtsFiles(dtsFiles);
    console.log(`Relevant .d.ts files: ${relevantDtsFiles.join(", ")}`);

    return relevantDtsFiles;
  }

  async filterRelevantDtsFiles(dtsFiles: string[]): Promise<string[]> {
    dtsFiles = dtsFiles.map((filePath) =>
      this.removeWorkspacePathFromFileIfNeeded(filePath)
    );
    const systemPrompt = `You are an expert software engineering analyzer.

    Instructions:
    1. You will receive a list of .d.ts file paths from the user to analyze.
    2. Always output the d.ts file paths again that are possibly to be relevant for the upcoming user task.

Only output a JSON array with possibly relevant d.ts files, no explainations before or after the JSON string[].

<UpcomingUserTask>
  Task title: ${this.memory.taskTitle}
  Task description: ${this.memory.taskDescription}
  Task instructions: ${this.memory.taskInstructions}
</UpcomingUserTask>
`;

    const userPrompt = `List of .d.ts files to analyze for relevance to the task:
${JSON.stringify(dtsFiles, null, 2)}

  Please return a JSON string array of the relevant files:`;

    let relevantFiles = (await this.callLLM(
      "engineering-agent",
      IEngineConstants.engineerModel,
      [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
      true
    )) as string[];

    try {
      console.log(JSON.stringify(relevantFiles, null, 2));
      relevantFiles = relevantFiles.map((filePath) =>
        this.addWorkspacePathToFileIfNeeded(filePath)
      );
      console.log("Filtered relveant files", relevantFiles);
      return relevantFiles;
    } catch (error) {
      console.error("Error parsing LLM response:", error);
      return [];
    }
  }

  async run() {
    await this.initializeFromGitHubIssue();
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
