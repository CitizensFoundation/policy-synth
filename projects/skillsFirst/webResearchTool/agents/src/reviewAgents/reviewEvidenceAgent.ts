import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { EducationType, EducationTypes } from "../educationTypes.js";

export class ReviewEvidenceQuoteAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  modelType: PsAiModelType = PsAiModelType.TextReasoning;

  override get maxModelTokensOut(): number {
    return 16384;
  }
  override get modelTemperature(): number {
    return 0.0;
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

  // Processing function for reviewing evidence quotes
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Reviewing evidence quotes for ${jobDescription.name}`
    );

    const educationRequirements = jobDescription.degreeAnalysis?.educationRequirements || [];

    // For all EducationTypes identified as True (except HighSchool)
    const educationRequirementsToReview = educationRequirements.filter(
      (req) => req.type !== EducationType.HighSchool
    );

    for (const requirement of educationRequirementsToReview) {
      // Ask the LLM to confirm the evidenceQuote
      const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions for education requirements.
Your task is to verify the evidence quote for the education requirement.

Education Requirement:
Type: ${requirement.type}
Evidence Quote: "${requirement.evidenceQuote}"

Please confirm if the evidence quote supports the conclusion that the job description mentions ${requirement.type}.

Answer only "True" if it supports or only "False" otherwise, nothing else.

Your True or False answer:`;

      const messages = [this.createSystemMessage(systemPrompt)];

      const resultText = await this.callModel(
        this.modelType,
        this.modelSize,
        messages,
        false // don't parse as JSON
      );

      const result = resultText.trim();

      if (result.toLowerCase() === "true") {
        // Evidence is confirmed
        this.logger.debug(`Evidence confirmed for ${requirement.type}`);
      } else {
        // Evidence is not confirmed
        this.logger.debug(`Evidence not confirmed for ${requirement.type}`);
        // Optionally handle discrepancies
      }
    }

    await this.updateRangedProgress(100, "Evidence quotes reviewed");
  }
}