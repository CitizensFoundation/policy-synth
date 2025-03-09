import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

export class FinalReviewAgent extends PolicySynthAgent {
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

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async processJobDescription(
    jobDescription: JobDescription,
    finalRewrittenText: string
  ): Promise<boolean> {
    const mem = this.memory as JobDescriptionMemoryData;
    await this.updateRangedProgress(0, `Starting final review for ${jobDescription.name}`);

    const systemPrompt = `<JobDescription>
Original Title: ${jobDescription.name}
Original Job Description (excerpt): ${jobDescription.text.substring(0, 200)}
Rewritten Job Description:
${finalRewrittenText}
</JobDescription>

You are an expert in evaluating rewritten job descriptions.

Your task is to verify that:
1. The job title remains unchanged.
2. The rewritten job description is written at a 10th grade reading level.
3. All essential details from the original job description are preserved in the rewritten version.

Return your evaluation in the following JSON format exactly:
{
  "passed": boolean,
  "feedback": "string"
}
Do not include any additional text.
`;

    const messages = [this.createSystemMessage(systemPrompt)];
    let resultText: any;
    try {
      resultText = await this.callModel(this.modelType, this.modelSize, messages, true, true);
    } catch (error) {
      mem.llmErrors.push(`FinalReviewAgent error for ${jobDescription.name}: ${error}`);
      await this.updateRangedProgress(100, `Final review failed for ${jobDescription.name}`);
      return false;
    }

    if (!resultText) {
      mem.llmErrors.push(`FinalReviewAgent received empty response for ${jobDescription.name}`);
      await this.updateRangedProgress(100, `Final review failed for ${jobDescription.name}`);
      return false;
    }

    let reviewResult: { passed: boolean; feedback: string };
    try {
      reviewResult = resultText as { passed: boolean; feedback: string };
    } catch (parseError) {
      mem.llmErrors.push(`FinalReviewAgent parsing error for ${jobDescription.name}: ${parseError}`);
      await this.updateRangedProgress(100, `Final review failed for ${jobDescription.name}`);
      return false;
    }

    await this.updateRangedProgress(100, `Final review completed for ${jobDescription.name}`);
    return reviewResult.passed;
  }
}