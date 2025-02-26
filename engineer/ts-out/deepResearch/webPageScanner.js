import pLimit from "p-limit";
// Core PolicySynth imports
import { GetWebPagesBaseAgent } from "@policysynth/agents/deepResearch/getWebPagesBase.js";
import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
/**
 * WebPageScanner merges the logic from your older “WebPageScanner” example
 * but uses the structure from your first snippet (PolicySynthAgent-based).
 */
export class WebPageScanner extends GetWebPagesBaseAgent {
    scanType;
    instructions;
    collectedWebPages = [];
    totalPagesSave = 0;
    /**
     * We override the modelTemperature from the base agent if needed
     */
    get modelTemperature() {
        // Force to 0 for more consistent completions
        return 0.0;
    }
    get maxModelTokensOut() {
        return 70000;
    }
    get reasoningEffort() {
        return "high";
    }
    currentStartTime;
    startTiming() {
        this.currentStartTime = new Date();
    }
    async addTimingResult(agentName) {
        const timeEnd = new Date();
        const timeTakenInSeconds = (timeEnd.getTime() - this.currentStartTime.getTime()) / 1000;
        this.memory.timingResults.push({
            agentName,
            totalTimeInSeconds: timeTakenInSeconds,
        });
        await this.saveMemory();
    }
    constructor(agent, memory, startProgress, endProgress, instructions) {
        // call the parent constructor from GetWebPagesBaseAgent
        super(agent, memory, startProgress, endProgress);
        this.instructions = instructions;
    }
    /**
     * A helper to sanitize text (kept from your old snippet).
     */
    sanitizeInput(text) {
        try {
            const buffer = Buffer.from(text, "utf8");
            const decodedText = buffer.toString("utf8");
            return decodedText;
        }
        catch (error) {
            console.error("Error sanitizing input text:", error);
            return "";
        }
    }
    /**
     * Render the scanning prompt, adjusting based on the scanType
     */
    renderScanningPrompt(text) {
        // We'll use the typical approach from your first snippet: build a system message
        // plus a human message. We base the system instructions on scanType:
        let systemMessageText = "";
        if (this.scanType === "documentation") {
            systemMessageText = `
You are an expert at extracting relevant documentation from web pages for a given task.

Important instructions:
1. Examine the <TextContext> and extract all documentation relevant to the <OverallTaskInstructions> provided by the user.
2. If nothing relevant is found, output: "No relevant documentation is found."
3. Output in Markdown format.
      `;
        }
        else if (this.scanType === "codeExamples") {
            systemMessageText = `
You are an expert at extracting source code examples from web pages for a given task.

Important instructions:
1. Examine the <TextContext> and output all source code examples highly relevant to the user's task.
2. Copy them word-for-word, preserving formatting.
3. If nothing relevant is found, output: "No relevant source code examples found."
4. Output in Markdown format.
      `;
        }
        else if (this.scanType === "solutionsForErrors") {
            systemMessageText = `
You are an expert at extracting solutions to errors from web pages for a given task.

Important instructions:
1. Examine the <TextContext> and the user's potential errors, then copy solutions from the <TextContext> that address those errors.
2. Copy them word-for-word, preserving formatting.
3. If nothing relevant is found, output: "No solutions to errors found."
4. Output in Markdown format.
      `;
        }
        else {
            // fallback or error
            systemMessageText = `Unknown scan type: ${this.scanType}. Just pass the text through.`;
        }
        // Create the final system message
        const systemMessage = this.createSystemMessage(systemMessageText);
        // You can embed additional context about your memory or instructions here:
        const userMessageText = `${this.memory.taskTitle
            ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>`
            : ""}

${this.memory.taskDescription
            ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>`
            : ""}

${this.memory.taskInstructions
            ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>`
            : ""}

${this.memory.likelyRelevantNpmPackageDependencies
            ? `<LikelyNPMDependencies>
${this.memory.likelyRelevantNpmPackageDependencies.join("\n")}
</LikelyNPMDependencies>`
            : ""}

<LikelyTypeScriptFilesInWorkspace>
${this.memory.existingTypeScriptFilesLikelyToChange.join("\n")}
</LikelyTypeScriptFilesInWorkspace>

<ImportantInstructionsFromUser>
${this.instructions}
</ImportantInstructionsFromUser>

<TextContext>
${text}
</TextContext>

Only output text from the <TextContext> if relevant. Do not create new code or try to fix errors. If not relevant, respond with one of the fallback messages above.
    `;
        const humanMessage = this.createHumanMessage(userMessageText);
        return [systemMessage, humanMessage];
    }
    /**
     * This is analogous to processPageAnalysis in your first snippet:
     * it calls the model with the scanning prompt.
     */
    async processPageAnalysis(text) {
        // If text is too short, skip
        if (text.length < 100) {
            return "No relevant content found (page text too short).";
        }
        const messages = this.renderScanningPrompt(text);
        this.startTiming();
        const analysis = await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages, false, true);
        await this.addTimingResult("WebPageScanner");
        if (process.env.PS_DEBUG_AI_MESSAGES) {
            console.log("AI Analysis result:", analysis);
        }
        return analysis;
    }
    /**
     * For each page, decide if it's PDF or HTML, fetch text, then do AI analysis
     */
    async analyzeSinglePage(url) {
        let content;
        try {
            // Use a single method to fetch and process the page
            content = await this.getAndProcessPage(url, "markdown");
        }
        catch (error) {
            this.logger.error(`Error processing page at ${url}: ${error}`);
            return;
        }
        // Normalize to an array if not already
        const contentArray = Array.isArray(content) ? content : [content];
        for (const text of contentArray) {
            const sanitizedText = this.sanitizeInput(text);
            const analysis = await this.processPageAnalysis(sanitizedText);
            if (analysis) {
                const finalResult = {
                    fromUrl: url,
                    analysis,
                };
                this.collectedWebPages.push(finalResult);
                this.totalPagesSave++;
            }
        }
    }
    /**
     * Main scanning method — uses concurrency with p-limit (like your first snippet).
     */
    async scan(listOfUrls, scanType, currentCountStatus) {
        this.scanType = scanType;
        // Deduplicate
        listOfUrls = Array.from(new Set(listOfUrls));
        this.logger.info(`Starting WebPageScanner for ${listOfUrls.length} URLs.`);
        this.collectedWebPages = [];
        this.totalPagesSave = 0;
        // concurrency
        const MAX_URLS_TO_FETCH_PARALLEL = 1;
        const limit = pLimit(MAX_URLS_TO_FETCH_PARALLEL);
        const tasks = listOfUrls.map((url, i) => limit(async () => {
            // Just a simple progress update
            const progress = Math.round(((i + 1) / listOfUrls.length) * 100);
            await this.updateRangedProgress((currentCountStatus.currentCount + 1) / currentCountStatus.totalCount, `Scanning (${currentCountStatus.currentCount + 1}/${currentCountStatus.totalCount}) ${url}`);
            this.logger.info(`Scanning ${url}...`);
            await this.analyzeSinglePage(url);
            currentCountStatus.currentCount++;
            await this.updateRangedProgress((currentCountStatus.currentCount + 1) / currentCountStatus.totalCount, `Scanned (${currentCountStatus.currentCount + 1}/${currentCountStatus.totalCount}) ${url}`);
        }));
        await Promise.all(tasks);
        this.logger.info(`Scan completed. Analyzed ${this.totalPagesSave} pages successfully.`);
        // Optionally save memory or do post-processing
        await this.saveMemory();
        return this.collectedWebPages;
    }
}
//# sourceMappingURL=webPageScanner.js.map