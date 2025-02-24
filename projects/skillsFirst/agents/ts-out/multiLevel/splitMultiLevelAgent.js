import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
/**
 * SplitMultiLevelJobDescriptionAgent uses an LLM prompt to first determine how many
 * levels are present in a job description and then calls the model once per level to extract
 * the corresponding text. The output is then stored in a JSON structure.
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
        return "medium";
    }
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    /**
     * Processes the provided job description by first determining how many levels are present,
     */
    async processJobDescription(jobDescription) {
        // Step 1: Determine the number of levels
        await this.updateRangedProgress(0, `Determining level count for ${jobDescription.titleCode}`);
        const countPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions. The text above may contain multiple distinct roles or levels (e.g., "Level 1", "Level 2", etc.).
Determine how many distinct levels are present in this job description.
If no explicit level markers are found, answer with "1".
Return only the number (an integer) with no additional commentary:`;
        const countMessages = [this.createSystemMessage(countPrompt)];
        let levelCountOutput;
        try {
            levelCountOutput = await this.callModel(this.modelType, this.modelSize, countMessages, false);
        }
        catch (error) {
            this.logger.error(error);
            this.memory.llmErrors.push(`SplitMultiLevelJobDescriptionAgent error in level count for ${jobDescription.titleCode}: ${error}`);
            // Fallback: assume 1 level if error occurs
            levelCountOutput = "1";
        }
        this.logger.info(`Level count output: ${levelCountOutput} for ${jobDescription.titleCode}`);
        // Parse the output to an integer; default to 1 if parsing fails.
        let levelCount = parseInt(levelCountOutput.trim(), 10);
        if (isNaN(levelCount) || levelCount < 1) {
            levelCount = 1;
        }
        this.logger.info(`Determined ${levelCount} level(s) for ${jobDescription.titleCode}`);
        this.logger.debug(`Full job description: ${jobDescription.text}`);
        // Step 2: For each level, extract the corresponding text.
        const result = [];
        for (let i = 1; i <= levelCount; i++) {
            await this.updateRangedProgress((i / levelCount) * 100, `Extracting text for Level ${i} of ${jobDescription.titleCode}`);
            const extractPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions. The text above may contain multiple distinct roles or levels, usually with different education requirements, indicated by headings such as "Level 1", "Level 2", etc..

Extract and output only the text corresponding to Level ${i}.

Output the whole job description exactly as it is except only include the text for the level you are currently processing. Do not change any wording otherwise.

Return only the plain text for that level with no additional commentary`;
            const extractMessages = [this.createSystemMessage(extractPrompt)];
            let extractedText;
            try {
                extractedText = await this.callModel(this.modelType, this.modelSize, extractMessages, false);
            }
            catch (error) {
                this.logger.error(error);
                this.memory.llmErrors.push(`SplitMultiLevelJobDescriptionAgent error extracting level ${i} for ${jobDescription.titleCode}: ${error}`);
                // Fallback to empty string if error occurs.
                extractedText = "";
            }
            this.logger.debug(`Extracted text for Level ${i} of ${jobDescription.titleCode}:\n ${extractedText.trim()}`);
            result.push({
                level: i,
                text: extractedText.trim(),
            });
        }
        await this.updateRangedProgress(100, `Completed splitting for ${jobDescription.titleCode}`);
        return result;
    }
}
//# sourceMappingURL=splitMultiLevelAgent.js.map