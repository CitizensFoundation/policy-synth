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
        await this.updateRangedProgress(0, `Splitting job description for ${jobDescription.titleCode}`);
        const extractPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

<CurrentTitleCodeToExtract>
${jobDescription.titleCode}
</CurrentTitleCodeToExtract>

<CurrentJobNameToExtract>
${jobDescription.name}
</CurrentJobNameToExtract>

TASK: Extract the job description for the job code and title from the multi-job job description, leave out any information about the other levels not applicable to this job code and title.

Output the plain text for the job description for the job code and title with no additional commentary: `;
        const extractMessages = [this.createSystemMessage(extractPrompt)];
        this.logger.debug(`Extracting text for job code and title ${jobDescription.titleCode} ${jobDescription.name}:\n ${JSON.stringify(extractMessages, null, 2)}`);
        let extractedText;
        try {
            extractedText = await this.callModel(this.modelType, this.modelSize, extractMessages, {
                parseJson: false,
            });
        }
        catch (error) {
            this.logger.error(error);
            this.memory.llmErrors.push(`SplitMultiLevelJobDescriptionAgent error extracting ${jobDescription.titleCode}: ${error}`);
            // Fallback to empty string if error occurs.
            extractedText = "";
        }
        this.logger.debug(`Extracted text for job code and title ${jobDescription.titleCode} ${jobDescription.name}:\n ${extractedText.trim()}`);
        jobDescription.originalText = jobDescription.text;
        jobDescription.rewrittenText = extractedText.trim();
        jobDescription.text = jobDescription.rewrittenText;
        await this.saveMemory();
        await this.updateRangedProgress(100, `Completed splitting for ${jobDescription.titleCode}`);
    }
}
//# sourceMappingURL=splitMultiLevelAgent.js.map