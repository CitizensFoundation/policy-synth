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

  async process() {
    await this.processAllAgents();
  }

  async setupMemoryIfNeeded() {
    if (!this.memory || !this.memory.subProblems) {
      this.memory = emptySmarterCrowdsourcingMemory(this.agent.group_id, this.agent.id);
      await this.saveMemory();
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
