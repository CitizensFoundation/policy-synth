import { PolicySynthOperationsAgent } from "../../../base/operationsAgent.js";
import { Worker, Job } from "bullmq";
import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { CreateSearchQueriesProcessor } from "../solutions/create/createSearchQueries.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { RankSearchQueriesProcessor } from "../solutions/ranking/rankSearchQueries.js";
import { RankSubProblemsProcessor } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesProcessor } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageProcessor } from "./create/createProblemStatementImage.js";
import { CreateRootCausesSearchQueriesProcessor } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesProcessor } from "./web/getRootCausesWebPages.js";
import { RankWebRootCausesProcessor } from "./ranking/rankWebRootCauses.js";
import { RateWebRootCausesProcessor } from "./ranking/rateWebRootCauses.js";
import { SearchWebForRootCausesProcessor } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesProcessor } from "./ranking/rankRootCausesSearchQueries.js";
import { RankRootCausesSearchResultsProcessor } from "./ranking/rankRootCausesSearchResults.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";

export class ProblemsAgent extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;
  job!: Job;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_PROBLEMS_PREPERATION;
  }

  async process() {
    await this.processAllAgents();;
  }

  get processors() {
    return [
        { processor: CreateProblemStatementImageProcessor, weight: 10 },
        { processor: CreateSubProblemsProcessor, weight: 15 },
        { processor: CreateEntitiesProcessor, weight: 10 },
        { processor: RankEntitiesProcessor, weight: 10 },
        { processor: RankSubProblemsProcessor, weight: 10 },
        { processor: CreateSubProblemImagesProcessor, weight: 15 },
        //{ processor: CreateSearchQueriesProcessor, weight: 10 },
        //{ processor: RankSearchQueriesProcessor, weight: 10 }, // SOLUTIONS
    ];
  }
}