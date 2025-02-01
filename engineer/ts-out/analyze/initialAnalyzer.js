import fs from "fs";
import path from "path";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js"; // or your new base agent
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export class PsEngineerInitialAnalyzer extends PolicySynthAgent {
    get maxModelTokensOut() {
        return 100000;
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
        return `Your are an expert software engineering analyzer.

      Instructions:
      1. Review the task name, description and instructions. You might just see the task instructions.
      2. You will see a list of all existing typescript files, output ones likely to change to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext for files likely to be relevant.
      3. You will see a list of all npm module dependencies, you should output likely to be relevant to likelyRelevantNpmPackageDependencies.
      4. You will see a list of all possible documentation files, you should output likely to be relevant to documentationFilesToKeepInContext.
      5. Always include all typedef d.ts files in the existingOtherTypescriptFilesToKeepInContext JSON field.
      6. Always output the full path into all the JSON string arrays.
      7. Only add files that already exist in existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext JSON fields
      8. Never add new files to add to existingTypeScriptFilesLikelyToChange and existingOtherTypescriptFilesToKeepInContext JSON fields add them to newLikelyFilesToAdd.
      9. Important: If the programming task is needs examples from online sources, if some specific library is being used or something new added set needsDocumentionsAndExamples to true.

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
        return `<AllNpmPackageDependencies>
    ${JSON.stringify(allNpmPackageDependencies, null, 2)}
    </AllNpmPackageDependencies>

    <AllDocumentationFiles>
    ${allDocumentationFiles.join("\n")}
    </AllDocumentationFiles>

    <AllTypescriptFiles>
    ${this.memory.allTypescriptSrcFiles?.join("\n")}
    </AllTypescriptFiles>

    ${this.memory.taskTitle ? `<TaskTitle>${this.memory.taskTitle}</TaskTitle>` : ""}
    ${this.memory.taskDescription ? `<TaskDescription>${this.memory.taskDescription}</TaskDescription>` : ""}
    ${this.memory.taskInstructions ? `\n<TaskInstructions>${this.memory.taskInstructions}</TaskInstructions>\n` : ""}

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
        const analysisResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, [
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