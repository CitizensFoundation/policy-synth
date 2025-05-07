import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { EducationType, EducationTypes } from "../educationTypes.js";
export class DetermineCollegeDegreeStatusAgent extends PolicySynthAgent {
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
    processCounter;
    totalProcesses;
    constructor(agent, memory, startProgress, endProgress, processCounter, totalProcesses) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
        this.processCounter = processCounter;
        this.totalProcesses = totalProcesses;
    }
    // Processing function for determining college degree status
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `${this.processCounter}/${this.totalProcesses}: Determining college degree status for ${jobDescription.name}`);
        const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

<EducationTypes>
${this.renderEducationTypes()}
</EducationTypes>

You are an expert in analyzing job descriptions for education requirements.

Your task is to determine if the job description includes a discussion of a college degree or higher education requirement.

Follow these determination steps:
- Check if the job needs a college degree or other higher education requirement.
- Determine the maximum degree requirement for the job based on the <EducationTypes> above.
- Check if the job description includes multiple job levels with different educational requirements.
- For each EducationType, check if the job description mentions any of the phrases associated with that type.

Provide the output in JSON format as follows:

\`\`\`json
{
  "needsCollegeDegree": boolean,
  "maximumDegreeRequirement": "string",
  "includesMultipleJobLevelsWithDifferentEducationalRequirements": boolean,
  "educationRequirements": [
    {
      "type": "EducationType",
      "evidenceQuote": "string"
    },
    // ...
  ]
}
\`\`\`

Do not include any explanations or comments before or after the JSON output.

Your JSON output:`;
        const userPrompt = `Please analyze the job description and provide the output in the specified JSON format.
`;
        const messages = [
            this.createSystemMessage(systemPrompt),
            this.createHumanMessage(userPrompt),
        ];
        let resultText = await this.callModel(this.modelType, this.modelSize, messages);
        if (!resultText) {
            this.memory.llmErrors.push(`DetermineCollegeDegreeStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            this.logger.error(`DetermineCollegeDegreeStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
            resultText = await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, messages);
        }
        const result = resultText;
        jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {};
        jobDescription.degreeAnalysis.needsCollegeDegree = result.needsCollegeDegree;
        jobDescription.degreeAnalysis.maximumDegreeRequirement = result.maximumDegreeRequirement;
        jobDescription.degreeAnalysis.educationRequirements = result.educationRequirements;
        jobDescription.degreeAnalysis.includesMultipleJobLevelsWithDifferentEducationalRequirements = result.includesMultipleJobLevelsWithDifferentEducationalRequirements;
        this.logger.debug(`College degree status determined for ${jobDescription.name} - ${result.needsCollegeDegree}`);
        await this.updateRangedProgress(100, "College degree status determined");
    }
    // Helper function to render education types
    renderEducationTypes() {
        const educationTypes = [
            EducationType.HighSchool,
            EducationType.CollegeCoursework,
            EducationType.AssociatesDegree,
            EducationType.BachelorsDegree,
            EducationType.MastersDegree,
            EducationType.DoctoralDegree,
        ];
        return educationTypes
            .map((type) => {
            const info = EducationTypes[type];
            return `${info.code} (${type}):
Criteria: The job description mentions any of the following phrases: ${info.phrases.join(", ")}`;
        })
            .join("\n\n");
    }
}
//# sourceMappingURL=determineStatus.js.map