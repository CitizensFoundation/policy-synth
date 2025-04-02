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
        return "high";
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

<CurrentTitleCodeToExtractInToANewJobDescription>
${jobDescription.titleCode}
</CurrentTitleCodeToExtractInToANewJobDescription>

<CurrentJobNameToExtractInToANewJobDescription>
${jobDescription.name}
</CurrentJobNameToExtractInToANewJobDescription>

You are an expert in analyzing job descriptions. The <JobDescription> above will contain multiple distinct roles or levels,
usually with different education requirements, indicated by headings such as "Level 1", "Level 2" for different job titles and title code.

Extract and output only the text for the job code and title you are currently processing. We only want to get the job description for one level, the one we are looking at.

Output the whole job description exactly as it is except only include the text for the job code and title you are currently processing. Do not change any wording otherwise.

Return only the plain text for that job code and title with no additional commentary`;
        const extractMessages = [this.createSystemMessage(extractPrompt)];
        let extractedText;
        try {
            extractedText = await this.callModel(this.modelType, this.modelSize, extractMessages, false);
        }
        catch (error) {
            this.logger.error(error);
            this.memory.llmErrors.push(`SplitMultiLevelJobDescriptionAgent error extracting ${jobDescription.titleCode}: ${error}`);
            // Fallback to empty string if error occurs.
            extractedText = "";
        }
        this.logger.debug(`Extracted text for job code and title ${jobDescription.titleCode}:\n ${extractedText.trim()}`);
        jobDescription.originalText = jobDescription.text;
        jobDescription.rewrittenText = extractedText.trim();
        jobDescription.text = jobDescription.rewrittenText;
        await this.saveMemory();
        await this.updateRangedProgress(100, `Completed splitting for ${jobDescription.titleCode}`);
    }
}
//# sourceMappingURL=splitMultiLevelAgent.js.map