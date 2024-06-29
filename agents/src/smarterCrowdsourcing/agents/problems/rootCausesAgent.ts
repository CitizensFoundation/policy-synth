import { PolicySynthOperationsAgent } from "../../../base/operationsAgent.js";
import { Worker, Job } from "bullmq";
import { CreateSubProblemsAgent } from "./create/createSubProblems.js";
import { CreateEntitiesAgent } from "./create/createEntities.js";
import { CreateSearchQueriesAgent } from "../solutions/create/createSearchQueries.js";
import { RankEntitiesAgent } from "./ranking/rankEntities.js";
import { RankSearchQueriesAgent } from "../solutions/ranking/rankSearchQueries.js";
import { RankSubProblemsAgent } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesAgent } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageAgent } from "./create/createProblemStatementImage.js";
import { CreateRootCausesSearchQueriesAgent } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesAgent } from "./web/getRootCausesWebPages.js";
import { RankWebRootCausesAgent } from "./ranking/rankWebRootCauses.js";
import { RateWebRootCausesAgent } from "./ranking/rateWebRootCauses.js";
import { SearchWebForRootCausesAgent } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesAgent } from "./ranking/rankRootCausesSearchQueries.js";
import { RankRootCausesSearchResultsAgent } from "./ranking/rankRootCausesSearchResults.js";
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
      { processor: CreateRootCausesSearchQueriesAgent, weight: 10 },
      { processor: RankRootCausesSearchQueriesAgent, weight: 10 },
      { processor: SearchWebForRootCausesAgent, weight: 20 },
      { processor: GetRootCausesWebPagesAgent, weight: 20 },
    ];
  }
}
