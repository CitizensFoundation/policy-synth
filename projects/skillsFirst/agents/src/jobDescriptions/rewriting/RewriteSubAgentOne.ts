import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

export class RewriteSubAgentOne extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  modelType: PsAiModelType = PsAiModelType.TextReasoning;
  override get maxModelTokensOut(): number {
    return 100000;
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

  async processJobDescription(jobDescription: JobDescription): Promise<string[]> {
    await this.updateRangedProgress(0, `Starting RewriteSubAgentOne for ${jobDescription.name}`);

    const systemPrompt = `You are an expert at rewriting complex job descriptions.

Given the job description below, rewrite the job details to a reading level equivalent to high school or GED.
The job title must remain unchanged.
Please generate three distinct rewritten versions that simplify the language, reduce complexity, and preserve the original job title.
Focus only on rewriting the description details while keeping the title exactly as provided.

Return your answer in JSON format exactly as follows:

\`\`\`json
{
  "rewrites": [
    "rewritten version 1",
    "rewritten version 2",
    "rewritten version 3"
  ]
}
\`\`\`

Job Description:
Title: ${jobDescription.name}
Details: ${jobDescription.text}

Do not include any explanation or additional commentary in your output.`;

    const messages = [this.createSystemMessage(systemPrompt)];

    let resultText: string;
    try {
      resultText = await this.callModel(this.modelType, this.modelSize, messages, true, true);
    } catch (error) {
      this.logger.error(`RewriteSubAgentOne error for ${jobDescription.name}: ${error}`);
      this.memory.llmErrors.push(`RewriteSubAgentOne error for ${jobDescription.name}: ${error}`);
      throw error;
    }

    let rewrites: string[] = [];
    try {
      const parsed = JSON.parse(resultText);
      if (parsed.rewrites && Array.isArray(parsed.rewrites)) {
        rewrites = parsed.rewrites;
      } else {
        throw new Error("Invalid JSON format: missing 'rewrites' array");
      }
    } catch (parseError) {
      this.logger.error(`Error parsing result from RewriteSubAgentOne for ${jobDescription.name}: ${parseError}`);
      this.memory.llmErrors.push(`RewriteSubAgentOne parse error for ${jobDescription.name}: ${parseError}`);
      throw parseError;
    }

    await this.updateRangedProgress(100, `RewriteSubAgentOne completed for ${jobDescription.name}`);
    return rewrites;
  }
}