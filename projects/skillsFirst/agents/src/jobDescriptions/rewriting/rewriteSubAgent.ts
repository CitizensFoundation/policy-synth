import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";

export class RewriteSubAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  override get maxModelTokensOut(): number {
    return 16000;
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

  async rewriteJobDescription(jobDescription: JobDescription): Promise<string> {
    await this.updateRangedProgress(
      0,
      `Starting RewriteSubAgentOne for ${jobDescription.name}`
    );

    const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert at rewriting complex job descriptions.

Given the job description above, rewrite the job description in full to a reading level equivalent to a 10th grade reading level.

The job title must remain unchanged.

Everything in the job description must be included in the rewritten version. Keep all data and information from the original job description.

Do not leave anything out, all information must be included, just write it in a reading level equivalent to a 10th grade reading level.

Keep the same format as the original with the same metadata. Do not use markdown, just output plain text format as the input job description format but with line breaks for formatting.

Do not include any explanation or additional commentary in your output, only the rewritten job description here:`;

    const messages = [this.createSystemMessage(systemPrompt)];

    let resultText: string;
    try {
      resultText = await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Large,
        messages,
        false
      );
    } catch (error) {
      this.logger.error(
        `RewriteSubAgentOne error for ${jobDescription.name}: ${error}`
      );
      this.memory.llmErrors.push(
        `RewriteSubAgentOne error for ${jobDescription.name}: ${error}`
      );
      throw error;
    }

    await this.updateRangedProgress(
      100,
      `RewriteSubAgentOne completed for ${jobDescription.name}`
    );
    return resultText;
  }
}
