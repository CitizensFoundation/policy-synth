import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { DifferenceAnalysisAgent } from "./rewriting/DifferenceAnalysisAgent.js";
import { JobDescriptionBucketAgent } from "./rewriting/JobDescriptionBucketAgent.js";
import { JobDescriptionRewriterMasterAgent } from "./rewriting/JobDescriptionRewriterMasterAgent.js";

export class JobDescriptionRewriterAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async runRewritingPipeline(): Promise<void> {
    const mem = this.memory as JobDescriptionMemoryData;
    await this.updateRangedProgress(0, "Starting rewriting pipeline");

    // Step 1: Run Difference Analysis for each job description
    for (const jobDescription of mem.jobDescriptions as JobDescription[]) {
      try {
        const diffAgent = new DifferenceAnalysisAgent(this.agent, mem, 0, 10);
        await diffAgent.processJobDescription(jobDescription);
      } catch (error) {
        this.logger.error(`DifferenceAnalysisAgent error for job ${jobDescription.name}: ${error}`);
        mem.llmErrors.push(`DifferenceAnalysisAgent error for ${jobDescription.name}: ${error}`);
      }
    }

    // Step 2: Filter job descriptions with readability mismatches
    const mismatchedJobDescriptions = (mem.jobDescriptions as JobDescription[]).filter(
      (jd) =>
        jd.readabilityAnalysis &&
        jd.readabilityAnalysis.readingLevelMatchesDegreeRequirement === false
    );
    this.logger.info(`Found ${mismatchedJobDescriptions.length} job descriptions with readability mismatches`);

    // Step 3: Bucket job descriptions by occupational classification
    let buckets: { [bucket: string]: JobDescription[] } = {};
    try {
      buckets = await JobDescriptionBucketAgent.bucketJobDescriptions(mismatchedJobDescriptions);
    } catch (error) {
      this.logger.error(`JobDescriptionBucketAgent error: ${error}`);
      mem.llmErrors.push(`JobDescriptionBucketAgent error: ${error}`);
    }

    // Step 4: For each bucket, invoke the Master Rewriter Agent to rewrite the job description
    for (const bucket in buckets) {
      const jobsInBucket = buckets[bucket];
      this.logger.info(`Processing bucket '${bucket}' with ${jobsInBucket.length} job descriptions`);
      for (const jobDescription of jobsInBucket) {
        try {
          const rewriterMasterAgent = new JobDescriptionRewriterMasterAgent(this.agent, mem, 0, 100);
          await rewriterMasterAgent.processJobDescription(jobDescription);
          // Add final rewritten job description to memory
          mem.rewrittenJobDescriptions.push(jobDescription);
        } catch (error) {
          this.logger.error(`JobDescriptionRewriterMasterAgent error for job ${jobDescription.name}: ${error}`);
          mem.llmErrors.push(`JobDescriptionRewriterMasterAgent error for ${jobDescription.name}: ${error}`);
        }
      }
    }

    await this.updateRangedProgress(100, "Rewriting pipeline completed");
  }

  async processJobDescription(_jobDescription: JobDescription): Promise<void> {
    await this.runRewritingPipeline();
  }
}