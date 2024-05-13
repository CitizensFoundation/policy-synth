import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsEngineerInitialAnalyzer } from "./analyze/initialAnalyzer.js";
import { PsEngineerExamplesWebResearchAgent } from "./webResearch/examplesWebResearch.js";
import { PsEngineerDocsWebResearchAgent } from "./webResearch/documentationWebResearch.js";
import { PsEngineerProgrammingAgent } from "./programming/programmingAgent.js";
import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
export class PSEngineerAgent extends PolicySynthAgentBase {
    memory;
    constructor() {
        super();
        this.memory = {
            actionLog: [],
            workspaceFolder: "/home/robert/Scratch/policy-synth-engineer-tests/agents",
            taskTitle: "Create LLM Abstractions for OpenAI, Claude Opus and Google Gemini with a common base class",
            taskDescription: `Our current system utilizes LangChain TS for modeling abstraction and is configured to support OpenAI's models, accessible both directly and through Azure.
        The goal is to expand this capability by integrating abstractions for Claude Opus and Google Gemini, with a design that allows easy addition of other models in the future. This is a typescript based es module NodeJS modern server application.`,
            taskInstructions: `1. Create a new base chat class src/models/baseChatModel.ts that has the same API as ChatOpenAI, this is a new file.
      2. Then create src/models/openAiChat.ts, src/models/claudeOpusChat.ts and src/models/googleGeminiChat.ts for chat only
      3. For the cloudeOpus use the @langchain/anthropic npm
      4. For the googleGemini use the @google/generative-ai npm
      5. For the new src/models/openAi.ts use the @langchain/openai npm
      6. The baseChatModel and the child classes should implement invoke((HumanMessage|SystemMessge)[]) and getNumTokensFromMessages methods, just like the ChatOpenAI class
      7. Do nothing else for now, just create those files and classes
      `,
            stages: PSEngineerAgent.emptyDefaultStages,
            docsSiteToScan: [
                "https://ai.google.dev/gemini-api/docs/get-started/node",
                "https://www.npmjs.com/package/@google/generative-ai",
                "https://www.npmjs.com/package/@langchain/anthropic",
                "https://js.langchain.com/docs/integrations/chat/openai",
                "https://js.langchain.com/docs/modules/model_io/chat/quick_start",
            ],
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
    removeCommentsFromCode(tsContent) {
        // Initialize the project
        const project = new Project({
            useInMemoryFileSystem: true // Important for not needing to read/write files to disk
        });
        // Create a source file in memory
        const sourceFile = project.createSourceFile('tempFile.ts', tsContent);
        // Remove the comments
        sourceFile.getDescendants().forEach(node => {
            if (node.getKindName() === 'SingleLineCommentTrivia' || node.getKindName() === 'MultiLineCommentTrivia') {
                node.replaceWithText('');
            }
        });
        // Get the modified content
        const modifiedContent = sourceFile.getFullText();
        // Optionally, remove the temporary file from the project if not needed
        project.removeSourceFile(sourceFile);
        return modifiedContent;
    }
    async searchDtsFilesInNodeModules() {
        const dtsFiles = [];
        const readDtsFilesRecursively = async (directory) => {
            try {
                const entries = fs.readdirSync(directory, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(directory, entry.name);
                    if (entry.isDirectory()) {
                        // Recursively read nested directories
                        await readDtsFilesRecursively(fullPath);
                    }
                    else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
                        // Add file to list if it's a .d.ts file
                        dtsFiles.push(fullPath);
                    }
                }
            }
            catch (error) {
                console.error(`Error reading directory ${directory}: ${error}`);
            }
        };
        const searchPackages = async () => {
            if (this.memory.likelyRelevantNpmPackageDependencies &&
                this.memory.likelyRelevantNpmPackageDependencies.length > 0) {
                for (const packageName of this.memory
                    .likelyRelevantNpmPackageDependencies) {
                    const packagePath = path.join(this.memory.workspaceFolder, "node_modules", packageName);
                    await readDtsFilesRecursively(packagePath);
                }
            }
            else {
                this.logger.warn("No npm packages to search .d.ts files");
            }
        };
        return searchPackages().then(() => dtsFiles);
    }
    async run() {
        this.memory.allTypescriptSrcFiles = await this.readAllTypescriptFileNames(this.memory.workspaceFolder);
        //TODO: Get .d.ts file for npms also likely to be relevant from the nodes_modules folder
        this.memory.allTypeDefsContents = this.memory.allTypescriptSrcFiles
            .map((filePath) => {
            if (filePath.endsWith(".d.ts")) {
                const content = this.removeCommentsFromCode(this.loadFileContents(filePath) || "");
                return `${path.basename(filePath)}:\n${content}`;
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
                const content = this.removeCommentsFromCode(this.loadFileContents(filePath) || "");
                return `${path.basename(filePath)}:\n${content}`;
            })
                .join("\n")}\n</AllRelevantNodeModuleTypescriptDefs>`;
        }
        else {
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