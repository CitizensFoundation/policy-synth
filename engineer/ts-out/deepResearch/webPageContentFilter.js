import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import pLimit from "p-limit";
import { PsEngineerAgentBase } from "../agentBase.js";
/**
 * Upgraded PsEngineerWebContentFilter class to use:
 * - `createSystemMessage` & `createHumanMessage` from your base agent
 * - `callModel` in place of direct ChatOpenAI usage
 * - optional concurrency using `p-limit` for filtering large arrays
 */
export class PsEngineerWebContentFilter extends PsEngineerAgentBase {
    memory;
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
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    /**
     * A short system prompt describing how the model should respond with “Yes” or “No”.
     */
    get filterSystemPrompt() {
        return `<Instructions>
      1. Review the task name, description, and instructions.
      2. You will see content from the web to decide if it's relevant to the task or not, to help inform the programming of this task.
      3. If the content to evaluate is empty, just answer "No"
      4. Only answer with: "Yes" or "No" indicating if the content is relevant or not to the task.
      </Instructions>

      <OutputFormat>
        Only answer with: "Yes" or "No" indicating if the content is relevant or not to the task.
      </OutputFormat>
    `;
    }
    /**
     * A user prompt that includes the user's dev task context plus the snippet to evaluate.
     */
    filterUserPrompt(contentToEvaluate) {
        // Add references to npm dependencies if present
        const npmDeps = this.memory.likelyRelevantNpmPackageDependencies?.length
            ? `<LikelyRelevantNpmDependencies>\n${this.memory.likelyRelevantNpmPackageDependencies.join("\n")}</LikelyRelevantNpmDependencies>`
            : "";
        return `
${this.memory.taskTitle ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>` : ""}

${this.memory.taskDescription ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>` : ""}

${this.memory.taskInstructions ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>` : ""}

${npmDeps ? `<NpmDependencies>
${npmDeps}
</NpmDependencies>` : ""}

${this.memory.existingTypeScriptFilesLikelyToChangeContents ? `<ExistingTypeScriptFilesLikelyToChangeContents>
  ${this.memory.existingTypeScriptFilesLikelyToChangeContents}
  </ExistingTypeScriptFilesLikelyToChangeContents>` : ""}

<ContentToEvaluateForRelevanceToTheTask>
${contentToEvaluate}
</ContentToEvaluateForRelevanceToTheTask>

Is the content relevant to the task? Yes or No:
    `;
    }
    /**
     * Filter incoming content: returns only items that the model deems “Yes”.
     * Optionally parallelize with p-limit if you have a large set of content.
     */
    async filterContent(webContentToFilter) {
        const filteredContent = [];
        // Optionally limit concurrency. Adjust as you wish:
        const concurrency = 5;
        const limit = pLimit(concurrency);
        // Create tasks for each content chunk
        const tasks = webContentToFilter.map((content) => limit(async () => {
            if (!content || content.trim().length < 70) {
                // If the snippet is too small, skip it
                this.logger.debug("Skipping short/empty content from the list of content to filter.");
                return;
            }
            // Build your conversation messages
            const messages = [
                this.createSystemMessage(this.filterSystemPrompt),
                this.createHumanMessage(this.filterUserPrompt(content)),
            ];
            this.startTiming();
            // Call model using the new callModel style
            const analysisResults = (await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, messages, false));
            await this.addTimingResult("WebPageContentFilter");
            const trimmedResponse = analysisResults.trim();
            if (trimmedResponse === "Yes") {
                filteredContent.push(content);
            }
            else {
                this.logger.debug(`filterContent: Content is NOT relevant to the task:\n${content}\n`);
            }
        }));
        // Run all tasks
        await Promise.all(tasks);
        return filteredContent;
    }
}
//# sourceMappingURL=webPageContentFilter.js.map