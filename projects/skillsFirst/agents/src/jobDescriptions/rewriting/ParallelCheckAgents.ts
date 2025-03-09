import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

interface ParallelCheckResult {
  allChecksPassed: boolean;
  aggregatedFeedback: string;
}

export class ParallelCheckAgents extends PolicySynthAgent {
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
    mergedText: string
  ): Promise<{ allChecksPassed: boolean; aggregatedFeedback: string }> {
    const mem = this.memory as JobDescriptionMemoryData;
    await this.updateRangedProgress(0, `Starting parallel checks for ${jobDescription.name}`);

    const systemPrompt = `<OriginalJobDescription>
${jobDescription.text}
</OriginalJobDescription>

<RewrittenJobDescription>
${mergedText}
</RewrittenJobDescription>

You are an expert in job description rewriting quality assurance.
Please perform the following checks on the rewritten job description:
1. Verify that all essential details from the original job description are preserved.
2. Confirm that there are no hallucinations or fabricated information in the rewritten text.
3. Ensure that the rewritten job description is appropriate for a 10th grade reading level.

Based on these checks, determine if the rewritten job description meets all criteria.
Return your evaluation in the following JSON format exactly with no additional text:
{
  "allChecksPassed": boolean,
  "aggregatedFeedback": "string"
}
`;

    const messages = [this.createSystemMessage(systemPrompt)];
    let resultText;
    try {
      resultText = await this.callModel(this.modelType, this.modelSize, messages, true, true);
    } catch (error) {
      mem.llmErrors.push(`ParallelCheckAgents error for ${jobDescription.name}: ${error}`);
      await this.updateRangedProgress(100, `Parallel checks failed for ${jobDescription.name}`);
      return { allChecksPassed: false, aggregatedFeedback: "Error during parallel checks." };
    }

    if (!resultText) {
      mem.llmErrors.push(`ParallelCheckAgents received empty response for ${jobDescription.name}`);
      await this.updateRangedProgress(100, `Parallel checks failed for ${jobDescription.name}`);
      return { allChecksPassed: false, aggregatedFeedback: "Empty response from model." };
    }

    let checkResult: ParallelCheckResult;
    try {
      checkResult = resultText as ParallelCheckResult;
    } catch (parseError) {
      mem.llmErrors.push(`ParallelCheckAgents parsing error for ${jobDescription.name}: ${parseError}`);
      await this.updateRangedProgress(100, `Parallel checks failed for ${jobDescription.name}`);
      return { allChecksPassed: false, aggregatedFeedback: "Parsing error." };
    }

    await this.updateRangedProgress(100, `Parallel checks completed for ${jobDescription.name}`);
    return checkResult;
  }
}