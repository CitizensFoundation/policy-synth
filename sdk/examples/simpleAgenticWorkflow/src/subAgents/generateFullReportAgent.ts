/**
 * subAgents/generateFullReportAgent.ts
 *
 * Sub-agent #2: Takes all participation data and generates a single summary report in Markdown.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

export class GenerateFullReportAgent extends PolicySynthAgent {
  declare memory: ParticipationDataAnalysisMemory;

  constructor(
    agent: PsAgent,
    memory: ParticipationDataAnalysisMemory,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  /**
   * Generate a single summary (Markdown) about all items in memory.participationDataItems,
   * including their themes and sentiments.
   */
  async process() {
    const items = this.memory.participationDataItems || [];


    const systemPrompt = `You are an expert at generating summaries from a set of classified short items.
Create a single cohesive markdown report describing:
- The most common themes and any interesting outliers
- Sentiment patterns (what is the general mood?)
- Important observations or recommendations, if any.

Keep it fairly concise, but mention key points.
Final format should be valid Markdown.`;

    const userPrompt = `Here are the participation items (with analysis):
${JSON.stringify(items, null, 2)}

Please provide your full detailed summary here in Markdown:`;

    const messages = [
      this.createSystemMessage(systemPrompt),
      this.createHumanMessage(userPrompt),
    ];

    let summaryMarkdown = "";
    try {
      summaryMarkdown = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Medium,
        messages,
        false
      );
    } catch (err) {
      summaryMarkdown = "Unable to generate summary.";
    }

    // Store in memory
    this.memory.fullReportOnAllItems = summaryMarkdown;

    await this.setCompleted("Summary report generated");
  }
}
