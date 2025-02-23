import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
/**
 * SplitMultiLevelJobDescriptionAgent uses an LLM prompt to detect and split a job description
 * into separate sub-levels (e.g., "Level 1", "Level 2", etc.). The output is a JSON array
 * of objects where each object contains the level number and the corresponding text.
 */
export class SplitMultiLevelJobDescriptionAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    modelType = PsAiModelType.TextReasoning;
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
    /**
     * Processes the provided job description and returns an array of splits.
     *
     * The expected output from the LLM is a JSON array of objects, each with:
     *  - "level": number (e.g., 1, 2, etc.)
     *  - "text": string (the text for that level)
     *
     * If no level markers are found, the agent returns a single object with level 1.
     */
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Splitting job description for ${jobDescription.titleCode}`);
        const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions. The text above may contain multiple distinct roles or levels, indicated by headings such as "Level 1", "Level 2", etc.

Your task is to split the job description into separate sub-levels. For each detected level, extract the level number and the corresponding text for that level.

Provide your output as a JSON array of objects. Each object must have:
- "level": a number (e.g., 1, 2, etc.)
- "text": the whole text of the job description but only for the level specified, just exclude the other levels but keep all the other text in the job description.

If no explicit level markers are found, return a single object with level 1 and the full text.

Do not include any additional commentary.
`;
        const messages = [this.createSystemMessage(systemPrompt)];
        let result;
        try {
            result = await this.callModel(this.modelType, this.modelSize, messages, true);
        }
        catch (error) {
            this.logger.error(error);
            this.memory.llmErrors.push(`SplitMultiLevelJobDescriptionAgent error for ${jobDescription.titleCode}: ${error}`);
            // Retry with a larger model if needed
            result = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Large, messages, true);
        }
        await this.updateRangedProgress(100, `Completed splitting for ${jobDescription.titleCode}`);
        return result;
    }
}
//# sourceMappingURL=splitMultiLevelAgent.js.map