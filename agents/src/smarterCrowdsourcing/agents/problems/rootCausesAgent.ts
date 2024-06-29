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
import { PsAgent } from "../../../dbModels/agent.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";

export class RootCausesAgent extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;
  job!: Job;

  async process() {
    await this.processAllAgents();;
  }

  get agentQueueName() {
    return  PsClassScAgentType.SMARTER_CROWDSOURCING_ROOT_CAUSES;
  }

  get processors() {
    return [
      { processor: CreateRootCausesSearchQueriesProcessor, weight: 10 },
      { processor: RankRootCausesSearchQueriesProcessor, weight: 10 },
      { processor: SearchWebForRootCausesProcessor, weight: 20 },
      { processor: GetRootCausesWebPagesProcessor, weight: 20 },
    ];
  }
}
