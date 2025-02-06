import fs from "fs";
import path from "path";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
import { PsEngineerAgentBase } from "../agentBase.js";
export class PsEngineerInitialAnalyzer extends PsEngineerAgentBase {
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
    ///////////////////////////////////
    // 1) Less Restrictive Prompt
    ///////////////////////////////////
    get analyzeSystemPrompt() {
        return `
<ImportantInstructions>
  1. You will receive the user’s coding task title, description, and instructions.
  2. You will see all existing TypeScript files. Output any that could possibly relate to or be impacted by the user's task.
     - This does NOT mean you are sure they will be changed; only that they could plausibly need changes or referencing.
  3. You will see a list of all npm dependencies. Output which are likely relevant.
  4. You will see all possible documentation files. Output which might be helpful.
  5. You will also see all possible TypeScript definition files.
     - If they could conceivably be relevant, list them.
  6. Output a JSON object matching the schema below (be flexible and inclusive rather than exclusive):
     {
       "existingTypeScriptFilesThatCouldPossiblyChangeForFurtherInvestigation": string[];
       "otherUsefulTypescriptCodeFilesThatCouldBeRelevant": string[];
       "usefulTypescriptDefinitionFilesThatCouldBeRelevant": string[];
       "documentationFilesThatCouldBeRelevant": string[];
       "likelyRelevantNpmPackageDependencies": string[];
       "needsDocumentationAndExamples": boolean;
     }
</ImportantInstructions>
`;
    }
    analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles) {
        const allTypescriptDefFiles = this.memory.allTypescriptSrcFiles?.filter((file) => file.endsWith(".d.ts"));
        const allTypescriptCodeFiles = this.memory.allTypescriptSrcFiles?.filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"));
        return `
<AllNpmPackageDependencies>
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
            ? `<TheUserCodingTaskInstructions>${this.memory.taskInstructions}</TheUserCodingTaskInstructions>`
            : ""}

TASK: Identify any possibly relevant files and dependencies for further investigation. Then output the JSON according to the schema described above.

Your JSON Output (no extra text, only valid JSON):
`;
    }
    ///////////////////////////////////
    // 2) Step to analyze each file’s relevance & store reasons
    ///////////////////////////////////
    /**
     * Analyze multiple files for how/why they might be relevant to the task.
     * Returns an array of PsCodeAnalyzeResults with a short "why" statement.
     */
    async analyzeFilesForRelevanceAndReasons(filePaths, userTaskInstructions, typeLabel) {
        this.logger.info(`Analyzing relevance/reason for ${typeLabel}...`);
        await this.updateRangedProgress(undefined, `Analyzing relevance reasons for ${typeLabel}...`);
        if (!filePaths || filePaths.length === 0) {
            this.logger.info(`No files to analyze for ${typeLabel}.`);
            return [];
        }
        if (!userTaskInstructions) {
            throw new Error("No user task instructions provided for file analysis.");
        }
        const results = [];
        // A system prompt that sets the context
        const systemPrompt = `<ImportantInstructions>
You are a specialized coding assistant.
You'll receive:
1. The user's high-level coding task instructions.
2. The content of a single file (documentation, .d.ts, or .ts code).

Return a detailed analysis on how/why this file could be relevant (or not) to the user's task.
If it is "Not relevant", say so. If it is relevant.
</ImportantInstructions>


<OutputFormat>:
{
   "filePath": string;
   "relevantFor": "likelyToChangeToImplementTask" | "goodReferenceCodeForTask" | "goodReferenceTypeDefinition" | "goodReferenceDocumentation" | "notRelevant";
   "detailedCodeAnalysisForRelevanceToTask": string;
}
</OutputFormat>`;
        // A user prompt template for each file
        const userPromptTemplate = `
<TheUserCodingTaskInstructions>
${userTaskInstructions}
</TheUserCodingTaskInstructions>

<File type="${typeLabel}">
CONTENT_PLACEHOLDER
</File>

Your JSON output:
`;
        for (const filePath of filePaths) {
            let fileContent = "";
            try {
                if (fs.existsSync(filePath)) {
                    fileContent = fs.readFileSync(filePath, "utf8");
                }
                else {
                    this.logger.warn(`File not found: ${filePath}`);
                    continue;
                }
            }
            catch (error) {
                this.logger.error(`Error reading file ${filePath}:`, error);
                continue;
            }
            const userPrompt = userPromptTemplate.replace("CONTENT_PLACEHOLDER", fileContent);
            this.startTiming();
            let rawResponse;
            try {
                rawResponse = await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, [
                    this.createSystemMessage(systemPrompt),
                    this.createHumanMessage(userPrompt),
                ], true);
                await this.addTimingResult("FileRelevanceAnalysis");
            }
            catch (err) {
                this.logger.error(`Error calling model for file ${filePath}:`, err);
                continue;
            }
            const finalObj = rawResponse;
            // Make sure filePath is correct
            finalObj.filePath = filePath;
            results.push(finalObj);
        }
        // Filter out any results that are not relevant
        return results.filter((result) => result.detailedCodeAnalysisForRelevanceToTask.trim().toLowerCase() !==
            "not relevant" && result.relevantFor !== "notRelevant");
    }
    /**
     * Reads the specified list of file paths from disk, returning a combined string
     * of the contents for reference. (Used for assembling context in memory.)
     */
    getFilesContents(analysisResults) {
        let contentsStr = "";
        analysisResults.forEach((result) => {
            let fileContent = "";
            try {
                if (fs.existsSync(result.filePath)) {
                    fileContent = fs.readFileSync(result.filePath, "utf8");
                }
                else {
                    this.logger.warn(`File not found: ${result.filePath}`);
                }
            }
            catch (err) {
                this.logger.error(`Error reading file ${result.filePath}:`, err);
            }
            contentsStr += `<CodePossiblyRelevant filename="${result.filePath}">
  <AnalysisOnHowItMightBeRelevant>${result.detailedCodeAnalysisForRelevanceToTask}</AnalysisOnHowItMightBeRelevant>
  <Code>${fileContent}</Code>
</CodePossiblyRelevant>
`;
        });
        return contentsStr;
    }
    ///////////////////////////////////
    // MAIN ENTRY POINT
    ///////////////////////////////////
    async analyzeAndSetup() {
        this.logger.info(`Analyzing and setting up task...`);
        // 1) Gather package deps
        const allNpmPackageDependencies = this.readNpmDependencies();
        // 2) Gather all .md docs
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
        // 3) Ask the LLM which files could *possibly* be relevant.
        this.startTiming();
        const analysisResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, [
            this.createSystemMessage(this.analyzeSystemPrompt),
            this.createHumanMessage(this.analyzeUserPrompt(allNpmPackageDependencies, allDocumentationFiles)),
        ], false);
        await this.addTimingResult("Analyzer Agent");
        // 4) Parse the planning results
        let analysisResults;
        if (typeof analysisResponse === "string") {
            analysisResults = JSON.parse(analysisResponse);
        }
        else {
            analysisResults = analysisResponse;
        }
        // 5) Store the raw results (string[] placeholders)
        this.memory.analysisResults = analysisResults;
        // Initialize memory arrays
        this.memory.existingTypeScriptFilesLikelyToChange = [];
        this.memory.usefulTypescriptDefinitionFilesToKeepInContext = [];
        this.memory.usefulTypescriptCodeFilesToKeepInContext = [];
        // 6) Combine the possibly-change and useful-code arrays into one.
        const possiblyChangeFiles = analysisResults.existingTypeScriptFilesThatCouldPossiblyChangeForFurtherInvestigation || [];
        const couldBeRelevantFiles = analysisResults.otherUsefulTypescriptCodeFilesThatCouldBeRelevant || [];
        // Merge and deduplicate
        const allCandidateFiles = [
            ...new Set([...possiblyChangeFiles, ...couldBeRelevantFiles]),
        ];
        // 7) Analyze that combined list in a single pass
        const codeAnalysis = await this.analyzeFilesForRelevanceAndReasons(allCandidateFiles, this.memory.taskInstructions || "", "code-files");
        // Filter them into the two memory buckets by their `relevantFor` property
        // (Note: you can expand this logic if needed, e.g. if some files are also type definitions, etc.)
        this.memory.existingTypeScriptFilesLikelyToChange = codeAnalysis.filter((res) => res.relevantFor === "likelyToChangeToImplementTask");
        this.memory.usefulTypescriptCodeFilesToKeepInContext = codeAnalysis.filter((res) => res.relevantFor === "goodReferenceCodeForTask");
        // 8) Analyze the definition files for short reasons
        const defFilesThatCouldBeRelevant = analysisResults.usefulTypescriptDefinitionFilesThatCouldBeRelevant || [];
        const defFilesAnalysis = await this.analyzeFilesForRelevanceAndReasons(defFilesThatCouldBeRelevant, this.memory.taskInstructions || "", "type-definition");
        this.memory.usefulTypescriptDefinitionFilesToKeepInContext = defFilesAnalysis;
        // 9) Documentation files (just store them, or analyze further if needed)
        this.memory.documentationFilesToKeepInContext =
            analysisResults.documentationFilesThatCouldBeRelevant;
        // 10) Mark whether we need docs/examples
        this.memory.needsDocumentationAndExamples =
            analysisResults.needsDocumentationAndExamples;
        // 11) Optionally gather combined contents for the "likelyToChange" set
        this.memory.existingTypeScriptFilesLikelyToChangeContents = this.getFilesContents(this.memory.existingTypeScriptFilesLikelyToChange);
        // 12) Save relevant npm deps
        this.memory.likelyRelevantNpmPackageDependencies =
            analysisResults.likelyRelevantNpmPackageDependencies;
        // Log action
        this.memory.actionLog.push(`Have done initial analysis.
       Possibly relevant code changed: ${this.memory.existingTypeScriptFilesLikelyToChange.length}
       Possibly relevant code references: ${this.memory.usefulTypescriptCodeFilesToKeepInContext.length}
       Possibly relevant definitions: ${defFilesAnalysis.length}.`);
        await this.saveMemory();
        this.logger.info(`Finished analysis and stored results with reasons in memory.`);
    }
}
//# sourceMappingURL=initialAnalyzer.js.map