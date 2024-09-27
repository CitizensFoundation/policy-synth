import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { EducationType, EducationTypes } from "../educationTypes.js";

export class DetermineCollegeDegreeStatusAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  maxModelTokensOut = 2048;
  modelTemperature = 0.0;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  // Processing function for determining college degree status
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Determining college degree status for ${jobDescription.name}`
    );

    const systemPrompt = `You are an expert in analyzing job descriptions for education requirements.
Your task is to determine if the job description includes a discussion of a college degree or higher education requirement.
Follow these determination steps:

- For each EducationType, check if the job description mentions any of the phrases associated with that type.

Education Types:
${this.renderEducationTypes()}

Provide the output in JSON format as follows:

\`\`\`json
{
  "needsCollegeDegree": boolean,
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
`;

    const userPrompt = `Job Description:
${jobDescription.text}

Please analyze the job description and provide the output in the specified JSON format.
`;

    const messages = [
      this.createSystemMessage(systemPrompt),
      this.createHumanMessage(userPrompt),
    ];

    const resultText = await this.callModel(
      PsAiModelType.Text,
      this.modelSize,
      messages,
      true
    );

    const result = resultText as {
      needsCollegeDegree: boolean;
      educationRequirements: JobEducationRequirement[];
    };

    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {} as JobDescriptionDegreeAnalysis;
    jobDescription.degreeAnalysis.needsCollegeDegree = result.needsCollegeDegree;
    jobDescription.degreeAnalysis.educationRequirements = result.educationRequirements;

    this.logger.debug(`College degree status determined for ${jobDescription.name} - ${result.needsCollegeDegree}`);

    await this.updateRangedProgress(100, "College degree status determined");
  }

  // Helper function to render education types
  private renderEducationTypes(): string {
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