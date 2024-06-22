import { BaseAgentProcessor } from "../base/baseAgentProcessor.js";
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
import { PolicySynthScAgentBase } from "../base/baseScAgentBase.js";
import { AgentProblemsProcessor } from "./problemsProcessor.js";

export class ProblemsAgent extends AgentProblemsProcessor {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  async processSubProblems() {
    const subProblemsProcessor = new CreateSubProblemsProcessor(
      this.job,
      this.memory
    );

    await subProblemsProcessor.process();
  }

  async process() {
    const createRootCausesSearchQueriesProcessor =
      new CreateRootCausesSearchQueriesProcessor(this.job, this.memory);
    await createRootCausesSearchQueriesProcessor.process();
    this.logger.info("createRootCausesSearchQueriesProcessor completed");

    const searchWebForRootCausesProcessor = new SearchWebForRootCausesProcessor(
      this.job,
      this.memory
    );
    await searchWebForRootCausesProcessor.process();
    this.logger.info("searchWebForRootCausesProcessor completed");

    const getRootCausesWebpagesProcessor = new GetRootCausesWebPagesProcessor(
      this.job,
      this.memory
    );
    await getRootCausesWebpagesProcessor.process();
    this.logger.info("getRootCausesWebpagesProcessor completed");

    const rankWebRootCausesProcessor = new RankWebRootCausesProcessor(
      this.job,
      this.memory
    );
    await rankWebRootCausesProcessor.process();
    this.logger.info("rankWebRootCausesProcessor completed");

    const rateWebRootCausesProcessor = new RateWebRootCausesProcessor(
      this.job,
      this.memory
    );
    await rateWebRootCausesProcessor.process();
    this.logger.info("rateWebRootCausesProcessor completed");

    const webGetRefinedRootCausesProcessor = new GetRefinedRootCausesProcessor(
      this.job,
      this.memory
    );
    await webGetRefinedRootCausesProcessor.process();
    this.logger.info("webGetRefinedRootCausesProcessor completed");

    const createSubProblemsProcessor = new CreateSubProblemsProcessor(
      this.job,
      this.memory
    );
    await createSubProblemsProcessor.process();
    this.logger.info("createSubProblemsProcessor completed");

    const createEntitiesProcessor = new CreateEntitiesProcessor(
      this.job,
      this.memory
    );
    await createEntitiesProcessor.process();
    this.logger.info("createEntitiesProcessor completed");

    const createSubProblemImagesProcessor = new CreateSubProblemImagesProcessor(
      this.job,
      this.memory
    );
    await createSubProblemImagesProcessor.process();
    this.logger.info("createSubProblemImagesProcessor completed");

    const createProblemStatementImageProcessor =
      new CreateProblemStatementImageProcessor(this.job, this.memory);
    await createProblemStatementImageProcessor.process();
    this.logger.info("createProblemStatementImageProcessor completed");

    const createSearchQueriesProcessor = new CreateSearchQueriesProcessor(
      this.job,
      this.memory
    );
    await createSearchQueriesProcessor.process();
    this.logger.info("createSearchQueriesProcessor completed");

    const rankRootCausesSearchResults =
      new RankRootCausesSearchResultsProcessor(this.job, this.memory);
    await rankRootCausesSearchResults.process();
    this.logger.info("rankRootCausesSearchResults completed");

    const rankRootCausesSearchQueries =
      new RankRootCausesSearchQueriesProcessor(this.job, this.memory);
    await rankRootCausesSearchQueries.process();
    this.logger.info("rankRootCausesSearchQueries completed");

    const rankEntitiesProcessor = new RankEntitiesProcessor(
      this.job,
      this.memory
    );
    await rankEntitiesProcessor.process();
    this.logger.info("rankEntitiesProcessor completed");

    const rankSearchQueriesProcessor = new RankSearchQueriesProcessor(
      this.job,
      this.memory
    );
    await rankSearchQueriesProcessor.process();
    this.logger.info("rankSearchQueriesProcessor completed");

    const rankSubProblemsProcessor = new RankSubProblemsProcessor(
      this.job,
      this.memory
    );
    await rankSubProblemsProcessor.process();
    this.logger.info("rankSubProblemsProcessor completed");

    const reduceSubProblemsProcessor = new ReduceSubProblemsProcessor(
      this.job,
      this.memory
    );
    await reduceSubProblemsProcessor.process();
    this.logger.info("reduceSubProblemsProcessor completed");
  }

  async setup() {
    const redisConfig = {
      host: "localhost",
      port: 6379,
    };

    new Worker(
      "agent-class-smarter-crowdsourcing-problems",
      async (job: Job) => {
        console.log(`Agent Problems Processing job ${job.id}`);
        const agent = new AgentProblemsProcessor();
        await agent.setup(job);
        await agent.process();
        return job.data;
      },
      {
        connection: redisConfig,
        concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
      }
    );
  }
}
