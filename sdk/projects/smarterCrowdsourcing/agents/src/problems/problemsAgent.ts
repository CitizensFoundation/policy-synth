import { CreateSubProblemsAgent } from "./create/createSubProblems.js";
import { CreateEntitiesAgent } from "./create/createEntities.js";
import { RankEntitiesAgent } from "./ranking/rankEntities.js";
import { RankSubProblemsAgent } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesAgent } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageAgent } from "./create/createProblemStatementImage.js";
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";

export class ProblemsAgentQueue extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_PROBLEMS_PREPERATION;
  }

  async process() {
    await this.processAllAgents();;
  }

  async setupMemoryIfNeeded() {
    if (!this.memory || !this.memory.subProblems) {
      this.memory = emptySmarterCrowdsourcingMemory(this.agent.group_id, this.agent.id);
      await this.saveMemory();
    }
  }

  get processors() {
    return [
        { processor: CreateProblemStatementImageAgent, weight: 10 },
        { processor: CreateSubProblemsAgent, weight: 10 },
        { processor: CreateEntitiesAgent, weight: 5 },
        { processor: RankEntitiesAgent, weight: 5 },
        { processor: RankSubProblemsAgent, weight: 50 },
        { processor: CreateSubProblemImagesAgent, weight: 20 }
    ];
  }
}