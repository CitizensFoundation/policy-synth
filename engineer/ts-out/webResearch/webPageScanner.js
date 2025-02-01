import pLimit from "p-limit";
// Core PolicySynth imports
import { GetWebPagesBaseAgent } from "@policysynth/agents/webResearch/getWebPagesBase.js";
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
    constructor(agent, memory, startProgress, endProgress, instructions) {
        // call the parent constructor from GetWebPagesBaseAgent
        super(agent, memory, startProgress, endProgress);
        this.instructions = instructions;
    }
    /**
     * We override the modelTemperature from the base agent if needed
     */
    get modelTemperature() {
        // Force to 0 for more consistent completions
        return 0.0;
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
You are an expert at extracting relevant documentation from web pages for a given task and NPM modules.

Important instructions:
1. Examine the <TextContext> and copy all documentation *highly relevant* to the task provided by the user.
2. Just copy relevant documentation word-for-word (maintaining basic formatting).
3. If nothing relevant is found, output: "No relevant documentation found."
4. Output in Markdown format.
      `;
        }
        else if (this.scanType === "codeExamples") {
            systemMessageText = `
You are an expert at extracting source code examples from web pages for a given task and NPM modules.

Important instructions:
1. Examine the <TextContext> and output all source code examples highly relevant to the user's task.
2. Copy them word-for-word, preserving formatting.
3. If nothing relevant is found, output: "No relevant source code examples found."
4. Output in Markdown format.
      `;
        }
        else if (this.scanType === "solutionsForErrors") {
            systemMessageText = `
You are an expert at extracting solutions to errors from web pages for a given task and NPM modules.

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
        const userMessageText = `
<TextContext>:
${text}
</TextContext>

---
${this.memory.taskTitle ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>` : ""}

${this.memory.taskDescription ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>` : ""}

${this.memory.taskInstructions ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>` : ""}

Likely NPM dependencies:
${this.memory.likelyRelevantNpmPackageDependencies.join("\n")}

Likely TypeScript files in workspace:
${this.memory.existingTypeScriptFilesLikelyToChange.join("\n")}

Important instructions from user: ${this.instructions}

Only output Markdown if relevant. If not relevant, respond with one of the fallback messages above.
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
        if (process.env.PS_DEBUG_AI_MESSAGES) {
            console.log("Messages for AI Analysis:", JSON.stringify(messages, null, 2));
        }
        const analysis = await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages, false);
        if (process.env.PS_DEBUG_AI_MESSAGES) {
            console.log("AI Analysis result:", analysis);
        }
        return analysis;
    }
    /**
     * Optionally handle PDF content if you want to preserve that logic.
     * This calls the PDF reader, merges text, etc.
     */
    async getAndProcessPdf(url) {
        return (await this.getAndProcessPage(url, "markdown"));
    }
    /**
     * Optionally handle HTML pages if you want to preserve that logic.
     * Could call your base class's getAndProcessPage method,
     * or your own implementation with puppeteer.
     */
    async getAndProcessHtml(url) {
        // If you have a base class method that fetches text, you can use it:
        // const content = await this.getAndProcessPage(url, "markdown");
        // return content;
        return (await this.getAndProcessPage(url, "markdown"));
    }
    /**
     * For each page, decide if it's PDF or HTML, fetch text, then do AI analysis
     */
    async analyzeSinglePage(url) {
        let text = "";
        if (url.toLowerCase().endsWith(".pdf")) {
            try {
                text = await this.getAndProcessPdf(url);
            }
            catch (error) {
                this.logger.error(`Error reading PDF at ${url}: ${error}`);
                return;
            }
        }
        else {
            try {
                text = await this.getAndProcessHtml(url);
            }
            catch (error) {
                this.logger.error(`Error reading HTML at ${url}: ${error}`);
                return;
            }
        }
        text = this.sanitizeInput(text);
        const analysis = await this.processPageAnalysis(text);
        if (analysis) {
            // Attach the URL so you know where it came from
            const finalResult = {
                fromUrl: url,
                analysis,
            };
            this.collectedWebPages.push(finalResult);
            this.totalPagesSave++;
        }
    }
    /**
     * Main scanning method — uses concurrency with p-limit (like your first snippet).
     */
    async scan(listOfUrls, scanType) {
        this.scanType = scanType;
        // Deduplicate
        listOfUrls = Array.from(new Set(listOfUrls));
        this.logger.info(`Starting WebPageScanner for ${listOfUrls.length} URLs.`);
        this.collectedWebPages = [];
        this.totalPagesSave = 0;
        // concurrency
        const MAX_URLS_TO_FETCH_PARALLEL = 5;
        const limit = pLimit(MAX_URLS_TO_FETCH_PARALLEL);
        let completed = 0;
        const tasks = listOfUrls.map((url, i) => limit(async () => {
            // Just a simple progress update
            const progress = Math.round(((i + 1) / listOfUrls.length) * 100);
            await this.updateRangedProgress(progress, `Scanning (${i + 1}/${listOfUrls.length}) ${url}`);
            this.logger.info(`Scanning ${url}...`);
            await this.analyzeSinglePage(url);
            completed++;
            await this.updateRangedProgress(progress, `Scanned (${completed}/${listOfUrls.length}) ${url}`);
        }));
        await Promise.all(tasks);
        this.logger.info(`Scan completed. Analyzed ${this.totalPagesSave} pages successfully.`);
        // Optionally save memory or do post-processing
        await this.saveMemory();
        return this.collectedWebPages;
    }
}
//# sourceMappingURL=webPageScanner.js.map