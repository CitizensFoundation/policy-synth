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

<thisDescriptionTitleCode>
${jobDescription.titleCode}
</thisDescriptionTitleCode>

<firstTask>
The text above may contain multiple distinct roles or levels (e.g., "Level 1", "Level 2", etc.).\n
Determine how many distinct levels are present in this job description.
If no explicit level markers are found, answer with "1".
</firstTask>

<secondTask>
At the end of the job description, you will see a table in a text format, first headers then the fields line by line, of other title codes that are related to this job.
Provide all the title codes from this table in the otherTitleCodesFromBottomTable field.
</secondTask>

<outputFormat>
{
  numberOfLevels: number;
  otherTitleCodesFromBottomTable: string[];
}
</outputFormat>

Return only the JSON object with no additional commentary:`;
        const countMessages = [this.createSystemMessage(countPrompt)];
        let levelCountOutput;
        try {
            levelCountOutput = await this.callModel(this.modelType, this.modelSize, countMessages, true);
        }
        catch (error) {
            this.logger.error(error);
            this.memory.llmErrors.push(`SplitMultiLevelJobDescriptionAgent error in level count for ${jobDescription.titleCode}: ${error}`);
            // Fallback: assume 1 level if error occurs
            levelCountOutput = {
                numberOfLevels: 1,
                otherTitleCodesFromBottomTable: [],
            };
        }
        this.logger.info(`Level count output: ${JSON.stringify(levelCountOutput, null, 2)} for ${jobDescription.titleCode}`);
        if (levelCountOutput.otherTitleCodesFromBottomTable.length > 0) {
            const doNotReprocessSet = new Set(this.memory.doNotReprocessTitleCodes || []);
            for (const code of levelCountOutput.otherTitleCodesFromBottomTable) {
                doNotReprocessSet.add(code);
            }
            this.memory.doNotReprocessTitleCodes = Array.from(doNotReprocessSet);
        }
        else {
            console.warn(`No other title codes from bottom table found for ${jobDescription.titleCode}`);
        }
        this.logger.debug(`Full job description: ${jobDescription.text}`);
        // Step 2: For each level, extract the corresponding text.
        const result = [];
        for (let i = 1; i <= levelCountOutput.numberOfLevels; i++) {
            await this.updateRangedProgress((i / levelCountOutput.numberOfLevels) * 100, `Extracting text for Level ${i} of ${jobDescription.titleCode}`);
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