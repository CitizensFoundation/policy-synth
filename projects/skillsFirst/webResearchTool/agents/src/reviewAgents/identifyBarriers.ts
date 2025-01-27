import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class IdentifyBarriersAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  modelType: PsAiModelType = PsAiModelType.Text;

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

    const resultText = await this.callModel(
      this.modelType,
      this.modelSize,
      messages,
      false
    );

    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {} as JobDescriptionDegreeAnalysis;
    jobDescription.degreeAnalysis.barriersToNonDegreeApplicants = resultText.trim();

    await this.updateRangedProgress(100, "Barriers identified");
  }
}