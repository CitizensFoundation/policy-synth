import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { RewriteSubAgent } from "./rewriteSubAgent.js";
import { ParallelCheckAgents } from "./parallelCheckAgents.js";

export class JobDescriptionRewriterMasterAgent extends PolicySynthAgent {
  declare memory: any;

  constructor(
    agent: PsAgent,
    memory: any,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async processJobDescription(jobDescription: JobDescription): Promise<void> {
    const mem = this.memory as JobDescriptionMemoryData;
    await this.updateRangedProgress(
      0,
      `Starting rewriting process for ${jobDescription.name}`
    );

    let rewriteAttempts = 0;
    const maxAttempts = 3;
    let finalRewrittenText = "";
    let rewrittenText = "";
    let reviewPassed = false;


    try {
      await this.updateRangedProgress(
        10,
        `Generating rewriting candidates for ${jobDescription.name}`
      );

      while (!reviewPassed && rewriteAttempts < maxAttempts) {
        const rewriteSubAgent = new RewriteSubAgent(this.agent, mem, 0, 20);
        rewrittenText = (await rewriteSubAgent.rewriteJobDescription(
          jobDescription
        )) as string;
        if (!rewrittenText) {
          throw new Error(
            `No rewrite versions generated for ${jobDescription.name}`
          );
        }

        rewriteAttempts++;

        /*await this.updateRangedProgress(
          50,
          `Performing parallel checks for ${jobDescription.name}`
        );
        const parallelCheckAgent = new ParallelCheckAgents(
          this.agent,
          mem,
          60,
          80
        );
        const parallelCheckResult =
          await parallelCheckAgent.processJobDescription(
            jobDescription,
            rewrittenText
          );
        if (!parallelCheckResult.allChecksPassed) {
          mem.llmErrors.push(
            `Parallel checks failed for ${jobDescription.name} on attempt ${rewriteAttempts}: ${parallelCheckResult.aggregatedFeedback}`
          );
          continue;
        }*/

        reviewPassed = true;
        await this.updateRangedProgress(
          90,
          `Rewritten text approved for ${jobDescription.name}`
        );
      }

      if (!reviewPassed) {
        throw new Error(
          `Failed to produce an acceptable rewritten version for ${jobDescription.name} after ${maxAttempts} attempts.`
        );
      }

      finalRewrittenText = rewrittenText;

      jobDescription.rewrittenText = finalRewrittenText;
      if (!mem.rewrittenJobDescriptions) {
        mem.rewrittenJobDescriptions = [];
      }
      mem.rewrittenJobDescriptions.push(jobDescription);

      await this.saveMemory();

      await this.updateRangedProgress(
        100,
        `Rewriting process completed for ${jobDescription.name}`
      );
    } catch (error) {
      mem.llmErrors.push(
        `JobDescriptionRewriterMasterAgent error for ${jobDescription.name}: ${error}`
      );
      await this.updateRangedProgress(
        100,
        `Rewriting process failed for ${jobDescription.name}`
      );
      throw error;
    }
  }
}
