import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { CreateSearchQueriesAgent } from "./create/createSearchQueries.js";
import { RankSearchQueriesAgent } from "./ranking/rankSearchQueries.js";
import { SearchWebAgent } from "./web/searchWeb.js";
import { RankSearchResultsAgent } from "./ranking/rankSearchResults.js";
import { SmarterCrowdsourcingGetWebPagesAgent } from "./web/getWebPages.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";

export class SolutionsWebResearchAgentQueue extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_SOLUTIONS_WEB_RESEARCH;
  }

  async setupMemoryIfNeeded(agentId: number) {
    if (!this.memory || !this.memory.subProblems) {
      this.logger.info(`Setting up memory for agent ${agentId}`);
      const psAgent = await this.getOrCreatePsAgent(agentId);
      this.memory = emptySmarterCrowdsourcingMemory(psAgent.group_id, psAgent.id);
    }
  }

  get processors() {
    return [
      { processor: CreateSearchQueriesAgent, weight: 10 },
      { processor: RankSearchQueriesAgent, weight: 10 },
      { processor: SearchWebAgent, weight: 5 },
      { processor: RankSearchResultsAgent, weight: 20 },
      { processor: SmarterCrowdsourcingGetWebPagesAgent, weight: 15 },
    ];
  }
}
