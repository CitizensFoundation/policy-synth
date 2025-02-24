import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { RewriteSubAgentOne } from "./RewriteSubAgentOne.js";
import { ChiefEditorSubAgent } from "./ChiefEditorSubAgent.js";
import { FinalReviewAgent } from "./FinalReviewAgent.js";
import { ParallelCheckAgents } from "./ParallelCheckAgents.js";

export class JobDescriptionRewriterMasterAgent extends PolicySynthAgent {
  declare memory: any;

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

  constructor(agent: PsAgent, memory: any, startProgress: number, endProgress: number) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async processJobDescription(jobDescription: JobDescription): Promise<void> {
    const mem = this.memory as JobDescriptionMemoryData;
    await this.updateRangedProgress(0, `Starting rewriting process for ${jobDescription.name}`);

    let rewriteAttempts = 0;
    const maxAttempts = 3;
    let finalRewrittenText = "";
    let reviewPassed = false;

    try {
      await this.updateRangedProgress(10, `Generating rewriting candidates for ${jobDescription.name}`);
      const rewriteSubAgent = new RewriteSubAgentOne(this.agent, mem, 0, 20);
      const rewriteVersions = await rewriteSubAgent.processJobDescription(jobDescription) as string[];
      if (!Array.isArray(rewriteVersions) || rewriteVersions.length === 0) {
        throw new Error(`No rewrite versions generated for ${jobDescription.name}`);
      }

      while (!reviewPassed && rewriteAttempts < maxAttempts) {
        rewriteAttempts++;
        await this.updateRangedProgress(30, `Merging rewriting candidates (attempt ${rewriteAttempts}) for ${jobDescription.name}`);
        const chiefEditorAgent = new ChiefEditorSubAgent(this.agent, mem, 20, 40);
        const mergedVersion = await chiefEditorAgent.processRewrites(jobDescription, rewriteVersions) as string;
        finalRewrittenText = mergedVersion;

        await this.updateRangedProgress(50, `Performing final review for ${jobDescription.name}`);
        const finalReviewAgent = new FinalReviewAgent(this.agent, mem, 40, 60);
        const finalReviewPassed = await finalReviewAgent.processJobDescription(jobDescription, finalRewrittenText);
        if (!finalReviewPassed) {
          mem.llmErrors.push(`Final review failed for ${jobDescription.name} on attempt ${rewriteAttempts}`);
          continue;
        }

        await this.updateRangedProgress(70, `Performing parallel checks for ${jobDescription.name}`);
        const parallelCheckAgent = new ParallelCheckAgents(this.agent, mem, 60, 80);
        const parallelCheckResult = await parallelCheckAgent.processJobDescription(jobDescription, finalRewrittenText);
        if (!parallelCheckResult.allChecksPassed) {
          mem.llmErrors.push(`Parallel checks failed for ${jobDescription.name} on attempt ${rewriteAttempts}: ${parallelCheckResult.aggregatedFeedback}`);
          continue;
        }

        reviewPassed = true;
        await this.updateRangedProgress(90, `Rewritten text approved for ${jobDescription.name}`);
      }

      if (!reviewPassed) {
        throw new Error(`Failed to produce an acceptable rewritten version for ${jobDescription.name} after ${maxAttempts} attempts.`);
      }

      jobDescription.text = finalRewrittenText;
      mem.rewrittenJobDescriptions.push(jobDescription);

      await this.updateRangedProgress(100, `Rewriting process completed for ${jobDescription.name}`);
    } catch (error) {
      mem.llmErrors.push(`JobDescriptionRewriterMasterAgent error for ${jobDescription.name}: ${error}`);
      await this.updateRangedProgress(100, `Rewriting process failed for ${jobDescription.name}`);
      throw error;
    }
  }
}