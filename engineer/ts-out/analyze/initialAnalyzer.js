import fs from "fs";
import path from "path";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js"; // or your new base agent
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
export class PsEngineerInitialAnalyzer extends PolicySynthAgent {
    get maxModelTokensOut() {
        return 80000;
    }
    get modelTemperature() {
        return 0.0;
    }
    get reasoningEffort() {
        return "high";
    }
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    readNpmDependencies() {
        const packageJsonPath = path.join(this.memory.workspaceFolder, "package.json");
        const packageJsonData = fs.readFileSync(packageJsonPath, "utf8");
        const packageJsonObj = JSON.parse(packageJsonData);
        return packageJsonObj.dependencies;
    }
    get analyzeSystemPrompt() {
        return `<ImportantInstructions>
  1. Review the task name, description and instructions. You might just see the task instructions.
  2. You will see a list of all existing typescript files in <AllTypescriptFiles>, output ones likely to change to existingTypeScriptFilesLikelyToChange and usefulTypescriptDefinitionFilesToKeepInContext for files likely to be relevant.
  3. You will see a list of all npm module dependencies, you should output likely to be relevant to likelyRelevantNpmPackageDependencies.
  4. You will see a list of all possible documentation files, you should output likely to be relevant to documentationFilesToKeepInContext.
  5. Instructions on how to use <AllDefinitionTypescriptFiles>:
  5.1. Look in <AllDefinitionTypescriptFiles> and add all possibly relevant *.d.ts files to the "usefulTypescriptDefinitionFilesToKeepInContext" JSON array.
  5.2. Look at the name of the file d.ts file, if it is relevant add it to the JSON array.
  5.3. VERY IMPORTANT: The main shared *.d.ts typedef files are often stored in the webApps/ folder structure so consider adding these to the usefulTypescriptDefinitionFilesToKeepInContext JSON array.
  6. Look in <AllCodeTypescriptFiles> and add all typescripts code files that are very likely to be relevant, but might not need changing in usefulTypescriptCodeFilesToKeepInContext.
  7. Always output the full file path into all the JSON string arrays.
  8. Important: If the programming task is needs examples from online sources, if some specific library is being used or something new added set needsDocumentationAndExamples to true.
</ImportantInstructions>
<OutputJsonSchema>
{
  newLikelyFilesToAdd: string[];
  existingTypeScriptFilesLikelyToChange: string[];
  usefulTypescriptDefinitionFilesToKeepInContext: string[];
  usefulTypescriptCodeFilesToKeepInContext: string[];
  documentationFilesToKeepInContext: string[];
  likelyRelevantNpmPackageDependencies: string[];
  needsDocumentationAndExamples: boolean;
}
</OutputJsonSchema>
    `;
    }
    analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles) {
        const allTypescriptDefFiles = this.memory.allTypescriptSrcFiles?.filter((file) => file.endsWith(".d.ts"));
        const allTypescriptCodeFiles = this.memory.allTypescriptSrcFiles?.filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"));
        return `<AllNpmPackageDependencies>
    ${JSON.stringify(allNpmPackageDependencies, null, 2)}
    </AllNpmPackageDependencies>

    <AllDocumentationFiles>
    ${allDocumentationFiles.join("\n")}
    </AllDocumentationFiles>

    ${allTypescriptDefFiles
            ? `<AllDefinitionTypescriptFiles>
    ${allTypescriptDefFiles.join("\n")}
    </AllDefinitionTypescriptFiles>`
            : ""}

    ${allTypescriptCodeFiles
            ? `<AllCodeTypescriptFiles>
    ${allTypescriptCodeFiles.join("\n")}
    </AllCodeTypescriptFiles>`
            : ""}

    ${this.memory.taskTitle
            ? `<TheUserCodingTaskTitle>${this.memory.taskTitle}</TheUserCodingTaskTitle>`
            : ""}
    ${this.memory.taskDescription
            ? `<TheUserCodingTaskDescription>${this.memory.taskDescription}</TheUserCodingTaskDescription>`
            : ""}
    ${this.memory.taskInstructions
            ? `\n<TheUserCodingTaskInstructions>${this.memory.taskInstructions}</TheUserCodingTaskInstructions>\n`
            : ""}

    TASK: Analyze the TheUserCodingTaskInstructions and the provided context, then output the JSON output as per the schema.

    Your JSON Output:
    `;
    }
    getFilesContents(filePaths) {
        let contentsStr = "";
        filePaths.forEach((filePath) => {
            let fileContent = "";
            try {
                if (fs.existsSync(filePath)) {
                    fileContent = fs.readFileSync(filePath, "utf8");
                }
                else {
                    this.logger.warn(`File not found: ${filePath}`);
                }
            }
            catch (err) {
                this.logger.error(`Error reading file ${filePath}:`, err);
            }
            contentsStr += `<CodeLikelyToChange filename="${filePath}">
${fileContent}
</CodeLikelyToChange>
`;
        });
        return contentsStr;
    }
    async analyzeAndSetup() {
        this.logger.info(`Analyzing and setting up task`);
        // Read dependencies from package.json
        const allNpmPackageDependencies = this.readNpmDependencies();
        // Utility to find all .md docs recursively
        const getAllDocumentationFiles = (folderPath) => {
            const files = [];
            const items = fs.readdirSync(folderPath);
            for (const item of items) {
                const itemPath = path.join(folderPath, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory() &&
                    item !== "ts-out" &&
                    item !== "node_modules") {
                    files.push(...getAllDocumentationFiles(itemPath));
                }
                else if (path.extname(item) === ".md") {
                    files.push(itemPath);
                }
            }
            return files;
        };
        const allDocumentationFiles = getAllDocumentationFiles(this.memory.workspaceFolder);
        // Use the new callModel approach
        const analysisResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Small, [
            this.createSystemMessage(this.analyzeSystemPrompt),
            this.createHumanMessage(this.analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles)),
        ], false // not streaming, set to true if you want streamed responses
        );
        let analyzisResults;
        if (typeof analysisResponse === "string") {
            analyzisResults = JSON.parse(analysisResponse);
        }
        else {
            // if the LLM returned an object (already parsed)
            analyzisResults = analysisResponse;
        }
        console.log(`Results: ${JSON.stringify(analyzisResults, null, 2)}`);
        // Store the results into memory
        this.memory.existingTypeScriptFilesLikelyToChange =
            analyzisResults.existingTypeScriptFilesLikelyToChange;
        this.memory.usefulTypescriptDefinitionFilesToKeepInContext =
            analyzisResults.usefulTypescriptDefinitionFilesToKeepInContext;
        this.memory.usefulTypescriptCodeFilesToKeepInContext =
            analyzisResults.usefulTypescriptCodeFilesToKeepInContext.filter((file) => !analyzisResults.existingTypeScriptFilesLikelyToChange.includes(file));
        this.memory.likelyRelevantNpmPackageDependencies =
            analyzisResults.likelyRelevantNpmPackageDependencies;
        this.memory.needsDocumentationAndExamples =
            analyzisResults.needsDocumentationAndExamples;
        this.memory.documentationFilesToKeepInContext =
            analyzisResults.documentationFilesToKeepInContext;
        this.memory.existingTypeScriptFilesLikelyToChangeContents =
            this.getFilesContents(analyzisResults.existingTypeScriptFilesLikelyToChange);
        this.memory.actionLog.push(`Have done initial analysis${analyzisResults.needsDocumentationAndExamples
            ? " and we need to search for context"
            : ""}`);
        await this.analyzeDocumentationRelevance();
        await this.saveMemory();
    }
    /**
     * Reads the contents of each .md file in memory.documentationFilesToKeepInContext
     * and checks if they are relevant to the user’s coding task.
     *
     * The LLM is asked to:
     *  - Summarize each document.
     *  - Assess whether it is relevant or not relevant to the task.
     *
     * The method then updates `memory` with a new property like
     * `relevantDocumentationSummaries` which can be used in subsequent steps.
     */
    async analyzeDocumentationRelevance() {
        this.logger.info("Analyzing documentation relevance...");
        await this.updateRangedProgress(undefined, "Analyzing documentation relevance...");
        // Get the list of documentation files to check
        const docsToCheck = this.memory.documentationFilesToKeepInContext || [];
        const relevantDocs = [];
        for (const docPath of docsToCheck) {
            let content = "";
            try {
                if (fs.existsSync(docPath)) {
                    content = fs.readFileSync(docPath, "utf8");
                }
                else {
                    this.logger.warn(`Documentation file not found: ${docPath}`);
                    continue;
                }
            }
            catch (error) {
                this.logger.error(`Error reading documentation file ${docPath}:`, error);
                continue;
            }
            // Build a system prompt that instructs the LLM on what to do for this document
            const systemPrompt = `
  <ImportantInstructions>
  You are a specialized documentation relevance analyzer. You will receive:
  1. The user's coding task instructions.
  2. The content of a single documentation file.
  Based on the provided content and task instructions, decide if the document is Relevant or Not Relevant.
  </ImportantInstructions>
      `;
            // Build the human prompt with the task instructions and the document content
            const userPrompt = `
  <TheUserCodingTaskInstructions>
  ${this.memory.taskInstructions || "No user instructions provided."}
  </TheUserCodingTaskInstructions>

  <Document fullDocPath="${docPath}">
  ${content}
  </Document>

  TASK:
  Output just a single word: either "Relevant" or "Not Relevant".
      `;
            // Call the LLM for the current document
            let rawResponse;
            try {
                rawResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Small, [
                    this.createSystemMessage(systemPrompt),
                    this.createHumanMessage(userPrompt),
                ], false);
            }
            catch (err) {
                this.logger.error(`Error calling model for document ${docPath}:`, err);
                continue;
            }
            // Parse the response (expecting just "Relevant" or "Not Relevant")
            let relevance;
            if (typeof rawResponse === "string") {
                const trimmedResponse = rawResponse.trim();
                if (trimmedResponse.includes("Not Relevant")) {
                    relevance = "Not Relevant";
                }
                else if (trimmedResponse.includes("Relevant")) {
                    relevance = "Relevant";
                }
                else {
                    this.logger.error(`Unrecognized response for document ${docPath}: ${trimmedResponse}`);
                }
            }
            else {
                this.logger.error(`Non-string response for document ${docPath}:`, rawResponse);
            }
            this.logger.info(`Document ${docPath} evaluated as: ${relevance}`);
            if (relevance === "Relevant") {
                relevantDocs.push(docPath);
            }
        }
        const removedCount = docsToCheck.length - relevantDocs.length;
        this.logger.info(`Removed ${removedCount} non-relevant documentation files.`);
        // Update memory to only keep the relevant documentation files
        this.memory.documentationFilesToKeepInContext = relevantDocs;
        this.memory.actionLog.push("Documentation relevance analysis completed. Non-relevant docs filtered out.");
    }
}
//# sourceMappingURL=initialAnalyzer.js.map