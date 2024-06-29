import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { RankSolutionsProcessor } from "./ranking/rankSolutions.js";
import { EvolvePopulationProcessor } from "./evolve/evolvePopulation.js";
import { CreateSolutionImagesProcessor } from "./create/createImages.js";
import { ReapSolutionsProcessor } from "./evolve/reapPopulation.js";
import { RateSolutionsProcessor } from "./ranking/rateSolutions.js";
import { GroupSolutionsProcessor } from "./group/groupSolutions.js";
import { RankProsConsProcessor } from "./ranking/rankProsCons.js";

export class SolutionsEvolutionAgent extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_SOLUTIONS_EVOLUTION;
  }

  async process() {
    await this.processAllAgents();
  }

  get processors() {
    return [
      { processor: RankSolutionsProcessor, weight: 10 },
      { processor: RateSolutionsProcessor, weight: 10 },
      { processor: GroupSolutionsProcessor, weight: 10 },
      { processor: EvolvePopulationProcessor, weight: 15 },
      { processor: ReapSolutionsProcessor, weight: 10 },
      { processor: CreateSolutionImagesProcessor, weight: 10 },
      { processor: RankProsConsProcessor, weight: 10 },
    ];
  }
}