import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class DetermineProfessionalLicenseRequirementAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Small;
  modelType: PsAiModelType = PsAiModelType.TextReasoning;

  static allLicenceTypes: string[] = [];

  override get maxModelTokensOut(): number {
    return 100000;
  }

  override get modelTemperature(): number {
    return 0.0;
  }

  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
  }

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

    const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions for professional license requirements.

Your task is to determine whether any professional license is required that might include a college or university degree requirement.

Please answer the following questions:

- ProfessionalLicenseRequirement.isLicenseRequired:
  Is a specified professional license required that might include a college or university degree requirement?
  Answer: true/false

- ProfessionalLicenseRequirement.licenseDescription:
  Quote the language describing the professional license requirement. Output this only if a professional license is required otherwise leave this field empty.

- ProfessionalLicenseRequirement.issuingAuthority:
  State the issuing entity of the professional license if known from the job description or your expertise. Output this only if a professional license is required otherwise leave this field empty.

- ProfessionalLicenseRequirement.includesDegreeRequirement:
  Does the professional license requirement include obtaining one of the specified degrees?
  Answer: true/false

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
    let resultText;
    try {
      resultText = await this.callModel(
        this.modelType,
        this.modelSize,
        messages,
        true,
        true
      );
    } catch (error) {
      this.logger.error(error);
      this.memory.llmErrors.push(
        `DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
      this.logger.error(
        `DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
    }

    if (!resultText) {
      this.memory.llmErrors.push(
        `DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
      this.logger.error(
        `DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
      // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
      resultText = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Large,
        messages,
        true
      );
    }

    const result = resultText as ProfessionalLicenseRequirement;

    jobDescription.degreeAnalysis =
      jobDescription.degreeAnalysis || ({} as JobDescriptionDegreeAnalysis);
    jobDescription.degreeAnalysis.professionalLicenseRequirement = result;

    if (
      jobDescription.degreeAnalysis &&
      jobDescription.degreeAnalysis.professionalLicenseRequirement &&
      jobDescription.degreeAnalysis.professionalLicenseRequirement
        .isLicenseRequired
    ) {
      await this.processLicenseTypes(jobDescription);
    }

    await this.updateRangedProgress(
      100,
      "Professional license requirements determined"
    );
  }

  async processLicenseTypes(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Determining license type for ${jobDescription.name}`
    );

    // Prepare a prompt that includes the current list of discovered license types.
    const existingLicenceTypes =
      DetermineProfessionalLicenseRequirementAgent.allLicenceTypes;

    const licenceDescription = jobDescription.degreeAnalysis.professionalLicenseRequirement?.licenseDescription;

    const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

Your task is to determine whether waht professional license is required that might include a college or university degree requirement.

Output a simple licence types like Medical Licence, Pilot Licence, Law Licence, Certified Public Accountant, etc.
Do not include details in the licence type like who it is issued by or what the requirements are, never include two options in the same licence type.

${
  existingLicenceTypes.length > 0
    ? `Use the already discovered license types and only add a new license type if it is not already in the list.`
    : ""
}

<ProfessionalLicenseDescriptionFoundInJobDescription>
${licenceDescription}
</ProfessionalLicenseDescriptionFoundInJobDescription>

${
  existingLicenceTypes.length > 0
    ? `<ExistingLicenseTypesWeHaveAlreadyDiscoveredUseThoseWhereEverPossible>
${existingLicenceTypes.join("\n")}
</ExistingLicenseTypesWeHaveAlreadyDiscoveredUseThoseWhereEverPossible>
`
    : ""
}

Please provide the license type in the following JSON format:
{
  "licenseType": "string"
}

Do not include any explanations or comments before or after the JSON output.
`;

    this.logger.debug(systemPrompt);
    const messages = [this.createSystemMessage(systemPrompt)];
    let result;
    try {
      result = await this.callModel(
        this.modelType,
        this.modelSize,
        messages,
        true
      );
    } catch (error) {
      this.logger.error(error);
      this.memory.llmErrors.push(
        `processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
      this.logger.error(
        `processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
    }

    if (!result) {
      this.memory.llmErrors.push(
        `processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
      this.logger.error(
        `processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`
      );
      // Calling a larger model to try to get a result and not a reasoning model
      result = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Large,
        messages,
        true
      );
    }

    // Ensure jobDescription.degreeAnalysis exists and update licenseTypes.
    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {};
    if (!jobDescription.degreeAnalysis.professionalLicenseRequirement) {
      jobDescription.degreeAnalysis.professionalLicenseRequirement =
        {} as ProfessionalLicenseRequirement;
    }
    jobDescription.degreeAnalysis.professionalLicenseRequirement.licenseType =
      result.licenseType;

    // Add the determined license type to the static array if it's new.
    if (
      result.licenseType &&
      !DetermineProfessionalLicenseRequirementAgent.allLicenceTypes.includes(
        result.licenseType
      )
    ) {
      DetermineProfessionalLicenseRequirementAgent.allLicenceTypes.push(
        result.licenseType
      );
      this.logger.debug(
        JSON.stringify(
          DetermineProfessionalLicenseRequirementAgent.allLicenceTypes,
          null,
          2
        )
      );
    }

    await this.updateRangedProgress(100, "License type determined");
  }
}
