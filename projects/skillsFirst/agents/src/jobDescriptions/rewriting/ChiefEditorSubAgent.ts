import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

export class ChiefEditorSubAgent extends PolicySynthAgent {
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

  async processRewrites(jobDescription: JobDescription, rewrites: string[]): Promise<string> {
    await this.updateRangedProgress(0, `ChiefEditorSubAgent started for ${jobDescription.name}`);

    const systemPrompt = `You are an expert text editor specializing in simplifying job descriptions.
Job Title: ${jobDescription.name}
Rewrite Versions:
1. ${rewrites[0]}
2. ${rewrites[1]}
3. ${rewrites[2]}
Your task is to review these rewrites and merge them into a single, refined version that preserves the original job title.
Ensure the final text is clear, concise, and written at a high school or GED reading level.
Return your answer in exactly the following JSON format:

\`\`\`json
{
  "mergedVersion": "Final merged version of the job description"
}
\`\`\`

Do not include any additional commentary or explanations.
`;

    const messages = [this.createSystemMessage(systemPrompt)];

    let resultText: string;
    try {
      resultText = await this.callModel(this.modelType, this.modelSize, messages, true, true);
    } catch (error) {
      this.logger.error(`ChiefEditorSubAgent error for ${jobDescription.name}: ${error}`);
      this.memory.llmErrors.push(`ChiefEditorSubAgent error for ${jobDescription.name}: ${error}`);
      throw error;
    }

    let mergedVersion: string;
    try {
      const parsed = JSON.parse(resultText);
      if (parsed.mergedVersion && typeof parsed.mergedVersion === "string") {
        mergedVersion = parsed.mergedVersion;
      } else {
        throw new Error("Invalid JSON format: missing 'mergedVersion' string");
      }
    } catch (parseError) {
      this.logger.error(`Error parsing result from ChiefEditorSubAgent for ${jobDescription.name}: ${parseError}`);
      this.memory.llmErrors.push(`ChiefEditorSubAgent parse error for ${jobDescription.name}: ${parseError}`);
      throw parseError;
    }

    await this.updateRangedProgress(100, `ChiefEditorSubAgent completed for ${jobDescription.name}`);
    return mergedVersion;
  }
}