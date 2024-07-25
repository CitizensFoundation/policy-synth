import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { RankSolutionsAgent } from "./ranking/rankSolutions.js";
import { EvolvePopulationAgent } from "./evolve/evolvePopulation.js";
import { CreateSolutionImagesAgent } from "./create/createImages.js";
import { ReapSolutionsAgent } from "./evolve/reapPopulation.js";
import { GroupSolutionsAgent } from "./group/groupSolutions.js";
import { RankProsConsAgent } from "./ranking/rankProsCons.js";
import { CreateInitialSolutionsAgent } from "./create/createSolutions.js";
import { CreateProsConsAgent } from "./create/createProsCons.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";

export class SolutionsEvolutionAgentQueue extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_SOLUTIONS_EVOLUTION;
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
    if (this.memory.subProblems[0].solutions.populations.length === 0) {
      // Create initial solutions for the first population
      return [
        { processor: CreateInitialSolutionsAgent, weight: 10 },
        { processor: CreateProsConsAgent, weight: 10 },
        { processor: RankProsConsAgent, weight: 20 },
        { processor: RankSolutionsAgent, weight: 30 },
        { processor: GroupSolutionsAgent, weight: 10 },
        { processor: CreateSolutionImagesAgent, weight: 20 },
      ];
    } else {
      return [
        { processor: EvolvePopulationAgent, weight: 20 },
        { processor: ReapSolutionsAgent, weight: 5 },
        { processor: CreateProsConsAgent, weight: 10 },
        { processor: RankProsConsAgent, weight: 10 },
        { processor: RankSolutionsAgent, weight: 25 },
        { processor: GroupSolutionsAgent, weight: 5 },
        { processor: CreateSolutionImagesAgent, weight: 25 },
      ];
    }
  }
}
