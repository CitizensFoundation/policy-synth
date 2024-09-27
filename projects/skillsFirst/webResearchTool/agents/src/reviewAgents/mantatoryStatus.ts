import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class DetermineMandatoryStatusAgent extends PolicySynthAgent {
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

  // Processing function for determining mandatory status
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Determining mandatory status for ${jobDescription.name}`
    );

    const systemPrompt = `You are an expert in analyzing job descriptions for education requirements.
Your task is to determine whether any college degree requirement is mandatory or permissive.

Job Description:
${jobDescription.text}

Please answer the following questions:

- DegreeRequirementStatus.isDegreeMandatory (2a):
  Is obtaining one of the specified degrees or credentials mandatory to be hired for the job?
  Answer: True/False

- DegreeRequirementStatus.hasAlternativeQualifications (2b):
  Does the JobDescription allow hiring applicants with alternative qualifications unrelated to the specified degrees (e.g., work experience, non-degree credentials)?
  Answer: True/False
  If True, list any discovered alternative qualifications.

- DegreeRequirementStatus.multipleQualificationPaths (2c):
  Do applicants have multiple paths to qualify (either the specified degrees or other qualifications)?
  Answer: True/False

- DegreeRequirementStatus.isDegreeAbsolutelyRequired (2d):
  Is a higher educational degree absolutely required for this job?
  Answer: True/False

- DegreeRequirementStatus.substitutionPossible (2d):
  Could specific skills or other qualifications substitute for the degree?
  Answer: True/False

Provide the answers in the following JSON format:

\`\`\`json
{
  "isDegreeMandatory": boolean,
  "hasAlternativeQualifications": boolean,
  "alternativeQualifications": ["string"],
  "multipleQualificationPaths": boolean,
  "isDegreeAbsolutelyRequired": boolean,
  "substitutionPossible": boolean
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

    const result = resultText as DegreeRequirementStatus;

    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {} as JobDescriptionDegreeAnalysis;
    jobDescription.degreeAnalysis.degreeRequirementStatus = result;

    // Handle mandatory status explanations based on conditions
    const explanations = await this.determineMandatoryStatusExplanations(
      jobDescription,
      result
    );

    jobDescription.degreeAnalysis.mandatoryStatusExplanations = explanations;

    await this.updateRangedProgress(100, "Mandatory status determined");
  }

  // Helper function to determine mandatory status explanations
  private async determineMandatoryStatusExplanations(
    jobDescription: JobDescription,
    degreeStatus: DegreeRequirementStatus
  ): Promise<MandatoryStatusExplanations> {
    const explanations: MandatoryStatusExplanations = {};

    if (degreeStatus.isDegreeMandatory && degreeStatus.hasAlternativeQualifications) {
      // Both 2a and 2b are True
      const systemPrompt = `Both DegreeRequirementStatus.isDegreeMandatory and DegreeRequirementStatus.hasAlternativeQualifications are True.
Explain why you reached the same conclusion for both, relying only on the job description and your expertise.

Job Description:
${jobDescription.text}

Provide the explanation without any additional text.
`;

      const messages = [this.createSystemMessage(systemPrompt)];

      const resultText = await this.callModel(
        PsAiModelType.Text,
        this.modelSize,
        messages,
        false
      );

      explanations.bothTrueExplanation = resultText.trim();
    }

    if (!degreeStatus.isDegreeMandatory && !degreeStatus.hasAlternativeQualifications) {
      // Both 2a and 2b are False
      const systemPrompt = `Both DegreeRequirementStatus.isDegreeMandatory and DegreeRequirementStatus.hasAlternativeQualifications are False.
Explain why you reached the same conclusion for both, relying only on the job description and your expertise.

Job Description:
${jobDescription.text}

Provide the explanation without any additional text.
`;

      const messages = [this.createSystemMessage(systemPrompt)];

      const resultText = await this.callModel(
        PsAiModelType.Text,
        this.modelSize,
        messages,
        false
      );

      explanations.bothFalseExplanation = resultText.trim();
    }

    // Degree requirement explanation
    const systemPrompt = `Explain your judgment regarding whether a higher educational degree is absolutely required for this job.

Job Description:
${jobDescription.text}

Provide the explanation without any additional text.
`;

    const messages = [this.createSystemMessage(systemPrompt)];

    const resultText = await this.callModel(
      PsAiModelType.Text,
      this.modelSize,
      messages,
      false
    );

    explanations.degreeRequirementExplanation = resultText.trim();

    return explanations;
  }
}