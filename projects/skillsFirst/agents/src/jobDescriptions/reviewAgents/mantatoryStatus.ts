import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class DetermineMandatoryStatusAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  modelType: PsAiModelType = PsAiModelType.TextReasoning;

  override get maxModelTokensOut(): number {
    return 100000;
  }
  override get modelTemperature(): number {
    return 0.0;
  }

  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
  }

  processCounter: number;
  totalProcesses: number;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number,
    processCounter: number,
    totalProcesses: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
    this.processCounter = processCounter;
    this.totalProcesses = totalProcesses;
  }

  // Processing function for determining mandatory status
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `${this.processCounter}/${this.totalProcesses}: Determining mandatory status for ${jobDescription.name}`
    );

    const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions for education requirements.
Your task is to determine whether any college degree requirement is mandatory or permissive.

Please answer the following questions:

- DegreeRequirementStatus.isDegreeMandatory:
  Is obtaining one of the specified degrees or credentials mandatory to be hired for the job?
  Answer: true/false

- DegreeRequirementStatus.hasAlternativeQualifications:
  Does the JobDescription allow hiring applicants with alternative qualifications unrelated to the specified degrees (e.g., work experience, non-degree credentials)?
  Answer: true/false
  If True, list any discovered alternative qualifications.

- DegreeRequirementStatus.multipleQualificationPaths:
  Do applicants have multiple paths to qualify (either the specified degrees or other qualifications)?
  Answer: true/false

- DegreeRequirementStatus.isDegreeAbsolutelyRequired:
  Is a higher educational degree absolutely required for this job?
  Answer: true/false

- DegreeRequirementStatus.substitutionPossible:
  Could specific skills or other qualifications substitute for the degree?
  Answer: true/false

Provide the answers in the following JSON format:

\`\`\`json
{
  "isDegreeMandatory": boolean,
  "hasAlternativeQualifications": boolean,
  "alternativeQualifications": string[],
  "multipleQualificationPaths": boolean,
  "isDegreeAbsolutelyRequired": boolean,
  "substitutionPossible": boolean
}
\`\`\`

Do not include any explanations or comments before or after the JSON output.
`;

    const messages = [this.createSystemMessage(systemPrompt)];

    let resultText = await this.callModel(
      this.modelType,
      this.modelSize,
      messages
    );

    if (!resultText) {
      this.memory.llmErrors.push(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
      this.logger.error(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
      // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
      resultText = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Large,
        messages
      );
    }

    const result = resultText as DegreeRequirementStatus;

    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {} as JobDescriptionDegreeAnalysis;
    jobDescription.degreeAnalysis.degreeRequirementStatus = result;

    // Handle mandatory status explanations based on conditions
    let explanations = await this.determineMandatoryStatusExplanations(
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
      const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

Both DegreeRequirementStatus.isDegreeMandatory and DegreeRequirementStatus.hasAlternativeQualifications are True.

Explain why this conclusion was reached, relying only on the job description and your expertise.

Your output:`;

      const messages = [this.createSystemMessage(systemPrompt)];

      let resultText = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Medium,
        messages,
        {
          parseJson: false,
        }
      );

      if (!resultText) {
        this.memory.llmErrors.push(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
        this.logger.error(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
        // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
        resultText = await this.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Large,
          messages,
          {
            parseJson: false,
          }
        );
      }

      explanations.bothTrueExplanation = resultText.trim();
    }

    if (!degreeStatus.isDegreeMandatory && !degreeStatus.hasAlternativeQualifications) {
      // Both 2a and 2b are False
      const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

Both DegreeRequirementStatus.isDegreeMandatory and DegreeRequirementStatus.hasAlternativeQualifications are False.
Explain why this reached the same conclusion for both, relying only on the job description and your expertise.

Provide the explanation without any additional text.
`;

      const messages = [this.createSystemMessage(systemPrompt)];

      let resultText = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Medium,
        messages,
        {
          parseJson: false,
        }
      );

      if (!resultText) {
        this.memory.llmErrors.push(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
        this.logger.error(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
        // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
        resultText = await this.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Large,
          messages,
          {
            parseJson: false,
          }
        );
      }

      explanations.bothFalseExplanation = resultText.trim();
    }

    // Degree requirement explanation
    const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

Explain why a higher educational degree is absolutely required for this job?

Provide the explanation without any additional text.

Your output:`;

    const messages = [this.createSystemMessage(systemPrompt)];

    let resultText = await this.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Medium,
      messages,
      {
        parseJson: false,
      }
    );

    if (!resultText) {
      this.memory.llmErrors.push(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
      this.logger.error(`DetermineMandatoryStatusAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
      // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
      resultText = await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Large,
        messages
      );
    }

    explanations.degreeRequirementExplanation = resultText.trim();

    return explanations;
  }
}