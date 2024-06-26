import { BaseAgentProcessor } from "../baseAgentProcessor.js";
import { Worker, Job } from "bullmq";
import { CreateSeedPoliciesProcessor } from "./create/createSeedPolicies.js";
import { CreatePolicyImagesProcessor } from "./create/createPolicyImages.js";
import { CreateEvidenceSearchQueriesProcessor } from "./create/createEvidenceSearchQueries.js";
import { SearchWebForEvidenceProcessor } from "./web/searchWebForEvidence.js";
import { GetEvidenceWebPagesProcessor } from "./web/getEvidenceWebPages.js";
import { RankWebEvidenceProcessor } from "./ranking/rankWebEvidence.js";
import { RateWebEvidenceProcessor } from "./ranking/rateWebEvidence.js";
import { GetRefinedEvidenceProcessor } from "./web/getRefinedEvidence.js";
import { GetMetaDataForTopWebEvidenceProcessor } from "./web/getMetaDataForTopWebEvidence.js";
import { PolicySynthAgentBase } from "../baseAgent.js";

export class AgentPolicies extends BaseAgentProcessor {
  declare memory: PsBaseMemoryData;

  override async initializeMemory(job: Job) {
    const jobData = job.data as PsWorkerData;

    this.memory = {
      redisKey: this.getRedisKey(jobData.groupId),
      groupId: jobData.groupId,
      communityId: jobData.communityId,
      domainId: jobData.domainId,
      currentStage: "policies-seed",
      stages: PolicySynthAgentBase.emptyDefaultStages,
      timeStart: Date.now(),
      totalCost: 0,
      customInstructions: {},
      problemStatement: {
        description: jobData.initialProblemStatement,
        searchQueries: {
          general: [],
          scientific: [],
          news: [],
          openData: [],
        },
        searchResults: {
          pages: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          },
        },
      },
      subProblems: [],
      currentStageData: undefined,
    } as PSMemoryData;
    await this.saveMemory();
  }

  async setStage(stage: PsMemoryStageTypes) {
    this.memory.currentStage = stage;
    this.memory.stages[stage].timeStart = Date.now();

    await this.saveMemory();
  }

  async process() {
    switch (this.memory.currentStage) {
      case "policies-seed":
        const createSeedPoliciesProcessor = new CreateSeedPoliciesProcessor(
          this.job,
          this.memory
        );
        await createSeedPoliciesProcessor.process();
        break;
      case "policies-create-images":
        const createPolicyImages = new CreatePolicyImagesProcessor(
          this.job,
          this.memory
        );
        await createPolicyImages.process();
        break;
      case "create-evidence-search-queries":
        const createEvidenceSearchQueries =
          new CreateEvidenceSearchQueriesProcessor(this.job, this.memory);
        await createEvidenceSearchQueries.process();
        break;
      case "web-search-evidence":
        const search = new SearchWebForEvidenceProcessor(this.job, this.memory);
        await search.process();
        break;
      case "web-get-evidence-pages":
        const getPages = new GetEvidenceWebPagesProcessor(
          this.job,
          this.memory
        );
        await getPages.process();
        break;
      case "rank-web-evidence":
        const ranker = new RankWebEvidenceProcessor(this.job, this.memory);
        await ranker.process();
        break;
      case "rate-web-evidence":
        const rater = new RateWebEvidenceProcessor(this.job, this.memory);
        await rater.process();
        break;
      case "web-get-refined-evidence":
        const refiner = new GetRefinedEvidenceProcessor(this.job, this.memory);
        await refiner.process();
        break;
      case "get-metadata-for-top-evidence":
        const meta = new GetMetaDataForTopWebEvidenceProcessor(
          this.job,
          this.memory
        );
        await meta.process();
        break;

      default:
        console.log("No stage matched");
    }
  }
}

const redisConfig = {
  host: "localhost",
  port: 6379,
};

const agent = new Worker(
  "agent-policies",
  async (job: Job) => {
    console.log(`Agent Policies Processing job ${job.id}`);
    const agent = new AgentPolicies();
    await agent.setup(job);
    await agent.process();
    return job.data;
  },
  { connection: redisConfig, concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1") }
);

process.on("SIGINT", async () => {
  await agent.close();
});
