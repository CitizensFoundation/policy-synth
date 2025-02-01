import fs from "fs";
import path from "path";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js"; // or your new base agent
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export class PsEngineerInitialAnalyzer extends PolicySynthAgent {
    /**
     * Adapted constructor:
     *   - If you don’t need a PsAgent object, you can pass a dummy object or adjust
     *     your base class constructor so it only needs memory.
     */
    constructor(agent, memory, startProgress, endProgress) {
        // This uses a dummy object for "agent" since the base class typically expects (agent, memory, ...).
        // Adjust as needed if you actually have a PsAgent instance to pass in.
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
        return `Your are an expert software engineering analyzer.

      Instructions:
      1. Review the task name, description and instructions.
      2. You will see a list of all existing typescript files, output ones likely to change to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext for files likely to be relevant.
      3. You will see a list of all npm module dependencies, you should output likely to be relevant to likelyRelevantNpmPackageDependencies.
      4. You will see a list of all possible documentation files, you should output likely to be relevant to documentationFilesToKeepInContext.
      5. Always include all typedef d.ts files in the existingOtherTypescriptFilesToKeepInContext JSON field.
      6. Always output the full path into all the JSON string arrays.
      7. Only add files that already exist in existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext JSON fields
      8. Never add new files to add to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext JSON fields add them to newLikelyFilesToAdd.
      9. Important: If the programming task is likely to benefit documentation or examples from online sources, set needsDocumentionsAndExamples to true.

      JSON Output Schema:
      {
        newLikelyFilesToAdd: string[];
        existingTypeScriptFilesLikelyToChange: string[];
        existingOtherTypescriptFilesToKeepInContext: string[];
        documentationFilesToKeepInContext: string[];
        likelyRelevantNpmPackageDependencies: string[];
        needsDocumentionsAndExamples: boolean;
      }
    `;
    }
    analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles) {
        return `All npm package.json dependencies:
    ${JSON.stringify(allNpmPackageDependencies, null, 2)}

    All documentation files in workspace:
    ${allDocumentationFiles.join("\n")}

    All already existing typescript files in workspace:
    ${this.memory.allTypescriptSrcFiles?.join("\n")}

    Task title: ${this.memory.taskTitle}
    Task description: ${this.memory.taskDescription}
    Task instructions: ${this.memory.taskInstructions}

    Your JSON Output:
    `;
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
                if (stat.isDirectory() && item !== "ts-out" && item !== "node_modules") {
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
        const analysisResponse = await this.callModel(PsAiModelType.TextReasoning, // pick your type
        PsAiModelSize.Medium, // pick your size
        [
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
        this.memory.existingOtherTypescriptFilesToKeepInContext =
            analyzisResults.existingOtherTypescriptFilesToKeepInContext;
        this.memory.likelyRelevantNpmPackageDependencies =
            analyzisResults.likelyRelevantNpmPackageDependencies;
        this.memory.needsDocumentionsAndExamples =
            analyzisResults.needsDocumentionsAndExamples;
        this.memory.documentationFilesToKeepInContext =
            analyzisResults.documentationFilesToKeepInContext;
        this.memory.actionLog.push(`Have done initial analysis${analyzisResults.needsDocumentionsAndExamples
            ? " and we need to search for context"
            : ""}`);
    }
}
//# sourceMappingURL=initialAnalyzer.js.map