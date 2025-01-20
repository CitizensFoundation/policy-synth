import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import sanitizeHtml from 'sanitize-html';
export class ReadingLevelUSGradeAnalysisAgentP2 extends PolicySynthAgent {
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
            allowedAttributes: {}
        });
        // 2. Decode known HTML entities like &nbsp;
        cleanedText = cleanedText.replace(/&nbsp;/g, ' ');
        // 3. Remove line breaks and carriage returns
        cleanedText = cleanedText.replace(/\r?\n|\r/g, ' ');
        // 4. Normalize multiple spaces to a single space and trim
        cleanedText = cleanedText.replace(/\s\s+/g, ' ').trim();
        return cleanedText;
    }
    // Helper function to handle LLM calls with retry
    async callLLM(prompt, maxRetries = 3) {
        const messages = [this.createSystemMessage(prompt)];
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const resultText = await this.callModel(this.modelType, this.modelSize, messages, true // Expecting JSON output
                );
                let result;
                if (typeof resultText === 'string') {
                    // Extract JSON from the resultText
                    let jsonString = resultText;
                    // Use a regular expression to match and extract JSON content from code blocks
                    const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
                    const match = resultText.match(jsonCodeBlockRegex);
                    if (match && match[1]) {
                        jsonString = match[1];
                        this.logger.debug('Extracted JSON from code block');
                    }
                    else {
                        this.logger.warn('No JSON code block found in LLM response, using entire response as JSON');
                    }
                    // Parse the extracted JSON string
                    try {
                        result = JSON.parse(jsonString);
                        this.logger.info('Successfully parsed JSON from LLM response');
                    }
                    catch (error) {
                        this.logger.error('Error parsing LLM response:', error);
                        throw new Error('Failed to parse LLM response as JSON.');
                    }
                }
                else if (typeof resultText === 'object') {
                    // LLM returned an object, use it directly
                    result = resultText;
                    this.logger.debug('LLM response is an object, using it directly');
                    this.logger.info('Successfully received JSON object from LLM');
                }
                else {
                    throw new Error(`Unexpected type of LLM response: ${typeof resultText}`);
                }
                // If successful, return the result
                return result;
            }
            catch (err) {
                this.logger.error(`Error on attempt ${attempt} for prompt: ${err}`);
                if (attempt === maxRetries) {
                    // After exhausting retries, do not throw.
                    this.logger.error(`Exceeded max retries for prompt, skipping this round.`);
                    return null; // Return null to indicate failure.
                }
                else {
                    this.logger.warn(`Retrying prompt... (${maxRetries - attempt} attempts left)`);
                    await new Promise(r => setTimeout(r, 2000)); // Optional delay before retrying
                }
            }
        }
    }
    // Processing function for analyzing reading level of job descriptions
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Analyzing reading level for ${jobDescription.name}`);
        // Clean the job description text before using it
        jobDescription.text = this.cleanJobDescriptionText(jobDescription.text);
        // Ensure readingLevelUSGradeAnalysis exists
        jobDescription.readingLevelUSGradeAnalysisP2 = jobDescription.readingLevelUSGradeAnalysisP2 || {};
        const readingLevelUSGradeAnalysisP2 = jobDescription.readingLevelUSGradeAnalysisP2;
        // Define the list of U.S. Grade Levels
        const gradeLevels = [
            "6th Grade",
            "7th Grade",
            "8th Grade",
            "9th Grade (Freshman High School)",
            "10th Grade",
            "11th Grade",
            "12th Grade (Senior High School)",
            "College Freshman",
            "College Sophomore",
            "College Junior",
            "College Senior",
            "College Graduate",
            "Postgraduate Level"
        ];
        // First Prompt: Identify the most difficult passages
        const firstPrompt = `Identify the most difficult to read and comprehend passages in the job description.

<JobDescriptionText>
${jobDescription.text}
</JobDescriptionText>

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
        const firstResult = await this.callLLM(firstPrompt);
        if (!firstResult) {
            // If null returned, skip this job description
            this.logger.warn('Skipping due to repeated LLM failure on first prompt.');
            return;
        }
        // Validate the structure of `difficultPassages`
        if (Array.isArray(firstResult.difficultPassages)) {
            const dpArray = firstResult.difficultPassages;
            const passages = dpArray.map((obj) => {
                const keys = Object.keys(obj);
                return keys.length > 0 ? obj[keys[0]] : null;
            }).filter((p) => p !== null);
            if (passages.length === 0) {
                this.logger.error('No passages found in the LLM response.');
                this.logger.warn('Skipping this round due to invalid LLM output.');
                return;
            }
            readingLevelUSGradeAnalysisP2.difficultPassages = passages;
        }
        else {
            this.logger.error('Invalid response format from LLM for difficult passages identification.');
            this.logger.warn('Skipping this round due to invalid LLM output.');
            return;
        }
        // Second Prompt: Determine the U.S. Grade Level Readability
        const difficultPassagesList = readingLevelUSGradeAnalysisP2.difficultPassages
            .map(passage => `- ${passage}`).join('\n');
        const secondPrompt = `Based on the following passages and the entire job description, what reading level must an individual have attained in order to fully comprehend the job description? Choose only from the U.S. Grade Levels listed:

${gradeLevels.join('\n')}

Most difficult passages:
${difficultPassagesList}

Job Description Text:
${jobDescription.text}

Provide your answer in the following JSON format:

\`\`\`json
{
  "U.S. Grade Level Readability": "Selected U.S. Grade Level"
}
\`\`\`

Do not include any explanations or additional text. Output only the JSON object.`;
        // Second LLM call with retry
        const secondResult = await this.callLLM(secondPrompt);
        if (!secondResult) {
            this.logger.warn('Skipping due to repeated LLM failure on second prompt.');
            return;
        }
        if (secondResult["U.S. Grade Level Readability"]) {
            const returnedLevel = secondResult["U.S. Grade Level Readability"];
            if (!gradeLevels.includes(returnedLevel)) {
                this.logger.error('Invalid U.S. Grade Level returned by LLM.');
                this.logger.warn('Skipping this round due to invalid U.S. Grade Level.');
                return;
            }
            // Assign the U.S. Grade Level to the readingLevelUSGradeAnalysis object
            readingLevelUSGradeAnalysisP2.usGradeLevelReadability = returnedLevel;
            this.logger.info('Reading level analysis completed successfully.');
        }
        else {
            this.logger.error('Invalid response from LLM for reading level analysis.');
            this.logger.warn('Skipping this round due to invalid LLM output.');
            return;
        }
        await this.updateRangedProgress(100, "Reading level analysis completed");
    }
}
//# sourceMappingURL=readingLevelUSGradeAnalysis2P.js.map