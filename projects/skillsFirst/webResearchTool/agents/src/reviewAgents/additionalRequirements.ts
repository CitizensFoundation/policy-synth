import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class DetermineProfessionalLicenseRequirementAgent extends PolicySynthAgent {
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

  // Processing function for determining professional license requirements
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Determining professional license requirements for ${jobDescription.name}`
    );

    const systemPrompt = `You are an expert in analyzing job descriptions for professional license requirements.
Your task is to determine whether any professional license is required that might include a college or university degree requirement.

Job Description:
${jobDescription.text}

Please answer the following questions:

- ProfessionalLicenseRequirement.isLicenseRequired (4a):
  Is a specified professional license mandatory to be hired?
  Answer: True/False

- ProfessionalLicenseRequirement.licenseDescription (4b):
  Quote the language describing the professional license requirement.

- ProfessionalLicenseRequirement.issuingAuthority (4c):
  State the issuing entity of the professional license if known from the job description or your expertise.

- ProfessionalLicenseRequirement.includesDegreeRequirement (4d):
  Does the professional license requirement include obtaining one of the specified degrees?
  Answer: True/False

Provide the answers in the following JSON format:

\`\`\`json
{
  "isLicenseRequired": boolean,
  "licenseDescription": "string",
  "issuingAuthority": "string",
  "includesDegreeRequirement": boolean
}
\`\`\`

Do not include any explanations or comments before or after the JSON output.
`;

    const messages = [this.createSystemMessage(systemPrompt)];

    const resultText = await this.callModel(
      PsAiModelType.Text,
      this.modelSize,
      messages,
      true
    );

    const result = resultText as ProfessionalLicenseRequirement;

    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {} as JobDescriptionDegreeAnalysis;
    jobDescription.degreeAnalysis.professionalLicenseRequirement = result;

    await this.updateRangedProgress(100, "Professional license requirements determined");
  }
}