import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { DifferenceAnalysisAgent } from "./rewriting/differenceAnalysisAgent.js";
import { JobDescriptionBucketAgent } from "./rewriting/bucketAgent.js";
import { JobDescriptionRewriterMasterAgent } from "./rewriting/rewriterMasterAgent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { JobDescriptionPairExporter } from "./rewriting/docExporter.js";
export class JobDescriptionRewriterAgent extends PolicySynthAgent {
    static JOB_DESCRIPTION_REWRITER_AGENT_CLASS_VERSION = 1;
    static JOB_DESCRIPTION_REWRITER_AGENT_CLASS_BASE_ID = "f340db77-476b-4195-bd51-6ea2a1610833";
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    async runRewritingPipeline() {
        const mem = this.memory;
        await this.updateRangedProgress(0, "Starting rewriting pipeline");
        let mismatchCount = 0;
        const diffAgent = new DifferenceAnalysisAgent(this.agent, mem, 0, 10);
        // Step 1: Run Difference Analysis for each job description
        for (const jobDescription of mem.jobDescriptions) {
            try {
                const needsRewriting = await diffAgent.processJobDescription(jobDescription);
                if (!needsRewriting) {
                    mismatchCount++;
                }
            }
            catch (error) {
                this.logger.error(`DifferenceAnalysisAgent error for job ${jobDescription.name}: ${error}`);
                mem.llmErrors.push(`DifferenceAnalysisAgent error for ${jobDescription.name}: ${error}`);
            }
        }
        this.logger.debug(`Found ${mismatchCount} job descriptions that need rewriting`);
        // Step 2: Filter job descriptions with readability mismatches
        const mismatchedJobDescriptions = mem.jobDescriptions.filter((jd) => jd.readingLevelGradeAnalysis &&
            jd.readingLevelGradeAnalysis.readingLevelMatchesDegreeRequirement === false);
        this.logger.info(`Found ${mismatchedJobDescriptions.length} job descriptions with readability mismatches`);
        // Step 3: Bucket job descriptions by occupational classification
        let buckets = {};
        try {
            buckets = JobDescriptionBucketAgent.bucketJobDescriptions(mismatchedJobDescriptions);
        }
        catch (error) {
            this.logger.error(`JobDescriptionBucketAgent error: ${error}`);
            mem.llmErrors.push(`JobDescriptionBucketAgent error: ${error}`);
            throw error;
        }
        this.memory.rewritingBuckets = buckets;
        await this.saveMemory();
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
                }
                catch (error) {
                    this.logger.error(`JobDescriptionRewriterMasterAgent error for job ${jobDescription.name}: ${error}`);
                    mem.llmErrors.push(`JobDescriptionRewriterMasterAgent error for ${jobDescription.name}: ${error}`);
                }
            }
        }
        await this.updateRangedProgress(90, "Exporting rewritten job descriptions to Google Doc");
        const exporter = new JobDescriptionPairExporter(this.agent, mem, 0, 100);
        await exporter.exportPairs();
        await this.updateRangedProgress(100, "Rewriting pipeline completed");
    }
    async process() {
        await this.runRewritingPipeline();
    }
    static getAgentClass() {
        return {
            class_base_id: this.JOB_DESCRIPTION_REWRITER_AGENT_CLASS_BASE_ID,
            user_id: 0,
            name: "Job Description Rewriter Agent",
            version: this.JOB_DESCRIPTION_REWRITER_AGENT_CLASS_VERSION,
            available: true,
            configuration: {
                category: PsAgentClassCategories.HRManagement,
                subCategory: "jobDescriptionAnalysis",
                hasPublicAccess: false,
                description: "An agent for rewriting job descriptions",
                queueName: "JOB_DESCRIPTION_REWRITING",
                imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/2e8adfc9-cf7c-4ddd-a1cc-639e59ee813c.png",
                iconName: "job_description_rewriting",
                capabilities: ["analysis", "text processing"],
                requestedAiModelSizes: [
                    PsAiModelSize.Small,
                    PsAiModelSize.Medium,
                    PsAiModelSize.Large,
                ],
                defaultStructuredQuestions: [
                    {
                        uniqueId: "numJobDescriptions",
                        type: "textField",
                        subType: "number",
                        value: 10,
                        maxLength: 4,
                        required: true,
                        text: "Number of job descriptions to analyze",
                    },
                ],
                supportedConnectors: [],
                questions: this.getConfigurationQuestions(),
            },
        };
    }
    static getConfigurationQuestions() {
        return [];
    }
}
//# sourceMappingURL=rewriterAgent.js.map