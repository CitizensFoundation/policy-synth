import { BaseAgentProcessor } from "../baseAgentProcessor.js";
import { Worker, Job } from "bullmq";
import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { CreateSearchQueriesProcessor } from "./create/createSearchQueries.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { RankSearchQueriesProcessor } from "./ranking/rankSearchQueries.js";
import { RankSearchResultsProcessor } from "../solutions/ranking/rankSearchResults.js";
import { RankSubProblemsProcessor } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesProcessor } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageProcessor } from "./create/createProblemStatementImage.js";
import { CreateRootCausesSearchQueriesProcessor } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesProcessor } from "./web/getRootCausesWebPages.js";
import { RankWebRootCausesProcessor } from "./ranking/rankWebRootCauses.js";
import { RateWebRootCausesProcessor } from "./ranking/rateWebRootCauses.js";
import { SearchWebForRootCausesProcessor } from "./web/searchWebForRootCauses.js";
import { GetRefinedRootCausesProcessor } from "./web/old/getRefinedRootCauses.js";
import { GetMetaDataForTopWebRootCausesProcessor } from "./web/getMetaDataForTopWebRootCauses.js";
import { ReduceSubProblemsProcessor } from "./create/reduceSubProblems.js";
import { RankRootCausesSearchQueriesProcessor } from "./ranking/rankRootCausesSearchQueries.js";
import { RankRootCausesSearchResultsProcessor } from "./ranking/rankRootCausesSearchResults.js";
import { PolicySynthAgentBase } from "../baseAgent.js";

export class AgentProblemsProcessor extends BaseAgentProcessor {
  declare memory: PsBaseMemoryData;

  async setStage(stage: PsMemoryStageTypes) {
    this.memory.currentStage = stage;
    this.memory.stages[stage].timeStart = Date.now();

    await this.saveMemory();
  }

  async processSubProblems() {
    const subProblemsProcessor = new CreateSubProblemsProcessor(
      this.job,
      this.memory
    );

    await subProblemsProcessor.process();
  }

  async process() {
    switch (this.memory.currentStage) {
      case "create-root-causes-search-queries":
        const createRootCausesSearchQueriesProcessor =
          new CreateRootCausesSearchQueriesProcessor(this.job, this.memory);
        await createRootCausesSearchQueriesProcessor.process();
        break;
      case "web-search-root-causes":
        const searchWebForRootCausesProcessor =
          new SearchWebForRootCausesProcessor(this.job, this.memory);
        await searchWebForRootCausesProcessor.process();
        break;
      case "web-get-root-causes-pages":
        const getRootCausesWebpagesProcessor =
          new GetRootCausesWebPagesProcessor(this.job, this.memory);
        await getRootCausesWebpagesProcessor.process();
        break;
      case "rank-web-root-causes":
        const rankWebRootCausesProcessor = new RankWebRootCausesProcessor(
          this.job,
          this.memory
        );
        await rankWebRootCausesProcessor.process();
        break;
      case "rate-web-root-causes":
        const rateWebRootCausesProcessor = new RateWebRootCausesProcessor(
          this.job,
          this.memory
        );
        await rateWebRootCausesProcessor.process();
        break;
      case "web-get-refined-root-causes":
        const webGetRefinedRootCausesProcessor =
          new GetRefinedRootCausesProcessor(this.job, this.memory);
        await webGetRefinedRootCausesProcessor.process();
        break;
      // case "get-metadata-for-top-root-causes":=
      //   const getMetadataForTopRootCauses = new GetMetaDataForTopWebRootCausesProcessor(this.job, this.memory);
      //   await getMetadataForTopRootCauses.process();
      //   break;
      case "create-sub-problems":
        await this.processSubProblems();
        break;
      case "create-entities":
        const createEntitiesProcessor = new CreateEntitiesProcessor(
          this.job,
          this.memory
        );
        await createEntitiesProcessor.process();
        break;
      case "create-sub-problem-images":
        const createSubProblemImagesProcessor =
          new CreateSubProblemImagesProcessor(this.job, this.memory);
        await createSubProblemImagesProcessor.process();
        break;
      case "create-problem-statement-image":
        const createProblemStatementImageProcessor =
          new CreateProblemStatementImageProcessor(this.job, this.memory);
        await createProblemStatementImageProcessor.process();
        break;
      case "create-search-queries":
        const createSearchQueriesProcessor = new CreateSearchQueriesProcessor(
          this.job,
          this.memory
        );
        await createSearchQueriesProcessor.process();
        break;
      case "rank-root-causes-search-results":
        const rankSearchResults = new RankRootCausesSearchResultsProcessor(
          this.job,
          this.memory
        );
        await rankSearchResults.process();
        break;
      case "rank-root-causes-search-queries":
        const rankRootCausesSearchQueries =
          new RankRootCausesSearchQueriesProcessor(this.job, this.memory);
        await rankRootCausesSearchQueries.process();
        break;
      case "rank-entities":
        const rankEntitiesProcessor = new RankEntitiesProcessor(
          this.job,
          this.memory
        );
        await rankEntitiesProcessor.process();
        break;
      case "rank-search-queries":
        const rankSearchQueriesProcessor = new RankSearchQueriesProcessor(
          this.job,
          this.memory
        );
        await rankSearchQueriesProcessor.process();
        break;
      case "rank-sub-problems":
        const rankSubProblemsProcessor = new RankSubProblemsProcessor(
          this.job,
          this.memory
        );
        await rankSubProblemsProcessor.process();
        break;
      case "reduce-sub-problems":
        const reduceSubProblemsProcessor = new ReduceSubProblemsProcessor(
          this.job,
          this.memory
        );
        await reduceSubProblemsProcessor.process();
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
  "agent-problems",
  async (job: Job) => {
    console.log(`Agent Problems Processing job ${job.id}`);
    const agent = new AgentProblemsProcessor();
    await agent.setup(job);
    await agent.process();
    return job.data;
  },
  {
    connection: redisConfig,
    concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1"),
  }
);

process.on("SIGINT", async () => {
  await agent.close();
});
