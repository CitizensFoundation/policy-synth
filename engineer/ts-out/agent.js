import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsEngineerInitialAnalyzer } from "./analyze/initialAnalyzer.js";
import { PsEngineerExamplesWebResearchAgent } from "./webResearch/examplesWebResearch.js";
import { PsEngineerDocsWebResearchAgent } from "./webResearch/documentationWebResearch.js";
import { PsEngineerProgrammingAgent } from "./programming/programmingAgent.js";
import fs from "fs";
import path from "path";
export class PSEngineerAgent extends PolicySynthAgentBase {
    memory;
    constructor() {
        super();
        this.memory = {
            actionLog: [],
            workspaceFolder: "/home/robert/Scratch/psAgentsTest",
            taskTitle: "Integrate LLM Abstractions for Claude Opus and Google Gemini into LangChain TS",
            taskDescription: "Our current system utilizes LangChain TS for modeling abstraction and is configured to support OpenAI's models, accessible both directly and through Azure. The goal is to expand this capability by integrating abstractions for Claude Opus and Google Gemini, with a design that allows easy addition of other models in the future.",
            taskInstructions: `1. Implement the new abstractions within the PolicySynthAgentBase class.
      2. Use the modelName parameter to determine the appropriate abstraction for each model.
      3. Set default configurations so that no modifications are needed in the existing codebase that utilizes the base agent class. This should ensure backward compatibility.`,
            stages: PSEngineerAgent.emptyDefaultStages,
        };
    }
    async doWebResearch() {
        const exampleResearcher = new PsEngineerExamplesWebResearchAgent(this.memory);
        const docsResearcher = new PsEngineerDocsWebResearchAgent(this.memory);
        const [exampleContextItems, docsContextItems] = await Promise.all([
            exampleResearcher.doWebResearch(),
            docsResearcher.doWebResearch(),
        ]);
        this.memory.exampleContextItems = exampleContextItems;
        this.memory.docsContextItems = docsContextItems;
        this.memory.actionLog.push("Web research completed");
    }
    async readAllTypescriptFileNames(folderPath) {
        const files = fs.readdirSync(folderPath);
        const allFiles = [];
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory() && file !== "ts-out" && file !== "node_modules") {
                const subFiles = await this.readAllTypescriptFileNames(filePath);
                allFiles.push(...subFiles);
            }
            else if (path.extname(file) === ".ts") {
                allFiles.push(filePath);
            }
        }
        return allFiles;
    }
    async run() {
        this.memory.allTypescriptSrcFiles = await this.readAllTypescriptFileNames(this.memory.workspaceFolder);
        this.memory.allTypeDefsContents = this.memory.allTypescriptSrcFiles
            .map(filePath => {
            console.log(`Checking file ${filePath}`);
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
        if (false && this.memory.needsDocumentionsAndExamples === true) {
            await this.doWebResearch();
        }
        const programmer = new PsEngineerProgrammingAgent(this.memory);
        await programmer.implementTask();
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
//# sourceMappingURL=agent.js.map