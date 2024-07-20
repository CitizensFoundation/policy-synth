import { CreateRootCausesSearchQueriesAgent } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesAgent } from "./web/getRootCausesWebPages.js";
import { SearchWebForRootCausesAgent } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesAgent } from "./ranking/rankRootCausesSearchQueries.js";
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { RankRootCausesSearchResultsAgent } from "./ranking/rankRootCausesSearchResults.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";

export class RootCausesAgentQueue extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  async process() {
    await this.processAllAgents();
  }

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_ROOT_CAUSES;
  }

  async setupMemoryIfNeeded() {
    if (!this.memory || !this.memory.subProblems) {
      this.memory = emptySmarterCrowdsourcingMemory(
        this.agent.group_id,
        this.agent.id
      );
      await this.saveMemory();
    }
  }

  get processors() {
    return [
      { processor: CreateRootCausesSearchQueriesAgent, weight: 10 },
      { processor: RankRootCausesSearchQueriesAgent, weight: 10 },
      { processor: SearchWebForRootCausesAgent, weight: 10 },
      { processor: RankRootCausesSearchResultsAgent, weight: 30 },
      { processor: GetRootCausesWebPagesAgent, weight: 40 },
    ];
  }
}
