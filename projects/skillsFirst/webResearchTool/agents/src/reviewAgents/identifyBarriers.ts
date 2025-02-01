import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class IdentifyBarriersAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Large;
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

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  // Processing function for identifying barriers
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Identifying barriers for non-degree applicants in ${jobDescription.name}`
    );

    const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions.

Your task is to identify any barriers or obstacles stated, suggested, or described in the job description to hiring an applicant who does not have a college or university degree.

If there are barriers, describe them.

If no barriers are found, state "No barriers found".

Provide the output as a plain text description without any additional text.

Your output:`;

    const messages = [this.createSystemMessage(systemPrompt)];

    let resultText = await this.callModel(
      this.modelType,
      this.modelSize,
      messages,
      false,
      true
    );

    if (!resultText) {
      this.memory.llmErrors.push(`IdentifyBarriersAgent - ${systemPrompt}`);
      this.logger.error(`IdentifyBarriersAgent - ${systemPrompt}`);
      // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
      resultText = await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Large,
        messages,
        false
      );
    }

    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {} as JobDescriptionDegreeAnalysis;
    jobDescription.degreeAnalysis.barriersToNonDegreeApplicants = resultText.trim();

    await this.updateRangedProgress(100, "Barriers identified");
  }
}