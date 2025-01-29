import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import sanitizeHtml from "sanitize-html";
export class ReadingLevelAnalysisAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    modelType = PsAiModelType.TextReasoning;
    get maxModelTokensOut() {
        return 16384;
    }
    get modelTemperature() {
        return 0.0;
    }
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    // Helper to clean up the job description text
    cleanJobDescriptionText(rawText) {
        // 1. Strip out all HTML tags
        let cleanedText = sanitizeHtml(rawText, {
            allowedTags: [],
            allowedAttributes: {},
        });
        // 2. Decode known HTML entities like &nbsp;
        cleanedText = cleanedText.replace(/&nbsp;/g, " ");
        // 3. Remove line breaks and carriage returns
        cleanedText = cleanedText.replace(/\r?\n|\r/g, " ");
        // 4. Normalize multiple spaces to a single space and trim
        cleanedText = cleanedText.replace(/\s\s+/g, " ").trim();
        return cleanedText;
    }
    // Helper function to handle LLM calls with retry
    async callLLM(prompt, maxRetries = 3) {
        const messages = [this.createSystemMessage(prompt)];
        try {
            const resultText = await this.callModel(this.modelType, this.modelSize, messages, true);
            // If successful, return the result
            return resultText;
        }
        catch (err) {
            this.logger.error(`Error on LLM call: ${err}`);
            throw new Error(`Error on LLM call: ${err}`);
        }
    }
    // Processing function for analyzing reading level of job descriptions
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Analyzing reading level for ${jobDescription.name}`);
        // Clean the job description text before using it
        jobDescription.text = this.cleanJobDescriptionText(jobDescription.text);
        // Ensure readingLevelGradeAnalysis exists
        jobDescription.readingLevelGradeAnalysis =
            jobDescription.readingLevelGradeAnalysis || {};
        const readingLevelGradeAnalysis = jobDescription.readingLevelGradeAnalysis;
        // Define the list of U.S. Grade Levels
        const gradeLevels = [
            "No Education Requirement",
            "High School",
            "Some College (but no degree)",
            "Associate’s Degree",
            "Bachelor’s Degree",
            "Master’s or Doctoral Degree",
        ];
        // First Prompt: Identify the most difficult passages
        const difficultPassagesPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

Identify the most difficult to read and comprehend passages in the job description.

Provide your answer in the following JSON format:

\`\`\`json
{
  "difficultPassages": [
    {"passage-1":"passage"},
    {"passage-2":"passage"},
    ...
  ]
}
\`\`\`

Do not include any explanations or additional text. Output only the JSON object.`;
        // First LLM call with retry
        const difficultPassagesResult = await this.callLLM(difficultPassagesPrompt);
        if (!difficultPassagesResult) {
            // If null returned, skip this job description
            this.logger.warn("Skipping due to repeated LLM failure on first prompt.");
            return;
        }
        // Validate the structure of `difficultPassages`
        if (Array.isArray(difficultPassagesResult.difficultPassages)) {
            const dpArray = difficultPassagesResult.difficultPassages;
            const passages = dpArray
                .map((obj) => {
                const keys = Object.keys(obj);
                return keys.length > 0 ? obj[keys[0]] : null;
            })
                .filter((p) => p !== null);
            if (passages.length === 0) {
                this.logger.error("No passages found in the LLM response.");
                this.logger.warn("Skipping this round due to invalid LLM output.");
                return;
            }
            readingLevelGradeAnalysis.difficultPassages = passages;
        }
        else {
            this.logger.error("Invalid response format from LLM for difficult passages identification.");
            this.logger.warn("Skipping this round due to invalid LLM output.");
            return;
        }
        // Second Prompt: Determine the U.S. Grade Level Readability
        const difficultPassagesList = readingLevelGradeAnalysis.difficultPassages
            .map((passage) => `- ${passage}`)
            .join("\n");
        const readabilityLevelPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

<MostDifficultPassages>
${difficultPassagesList}
</MostDifficultPassages>

Based on the most difficult passages and the entire job description, what reading level must an individual have attained in order to fully comprehend the job description? Choose only from the Grade Levels listed:

<GradeLevels>
${gradeLevels.join("\n")}
</GradeLevels>

Provide your answer in the following JSON format:

\`\`\`json
{
  "readabilityLevel": "Selected Grade Level"
}
\`\`\`

Do not include any explanations or additional text. Output only the JSON object.`;
        // Second LLM call with retry
        const readabilityLevelResult = await this.callLLM(readabilityLevelPrompt);
        if (!readabilityLevelResult) {
            this.logger.error("Skipping due to repeated LLM failure on second prompt.");
            return;
        }
        const returnedLevel = readabilityLevelResult.readabilityLevel;
        if (!gradeLevels.includes(returnedLevel)) {
            this.logger.error("Invalid U.S. Grade Level returned by LLM.");
            this.logger.warn("Skipping this round due to invalid U.S. Grade Level.");
            return;
        }
        // Assign the U.S. Grade Level to the readingLevelGradeAnalysis object
        readingLevelGradeAnalysis.readabilityLevel = returnedLevel;
        this.logger.info("Reading level analysis completed successfully.");
        await this.updateRangedProgress(100, "Reading level analysis completed");
    }
}
//# sourceMappingURL=readingLevelAnalysis.js.map