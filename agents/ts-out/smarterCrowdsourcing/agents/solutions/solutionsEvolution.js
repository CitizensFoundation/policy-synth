import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { RankSolutionsAgent } from "./ranking/rankSolutions.js";
import { EvolvePopulationAgent } from "./evolve/evolvePopulation.js";
import { CreateSolutionImagesAgent } from "./create/createImages.js";
import { ReapSolutionsAgent } from "./evolve/reapPopulation.js";
import { RateSolutionsAgent } from "./ranking/rateSolutions.js";
import { GroupSolutionsAgent } from "./group/groupSolutions.js";
import { RankProsConsAgent } from "./ranking/rankProsCons.js";
export class SolutionsEvolutionAgent extends PolicySynthAgentQueue {
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_SOLUTIONS_EVOLUTION;
    }
    async process() {
        await this.processAllAgents();
    }
    get processors() {
        return [
            { processor: RankSolutionsAgent, weight: 10 },
            { processor: RateSolutionsAgent, weight: 10 },
            { processor: GroupSolutionsAgent, weight: 10 },
            { processor: EvolvePopulationAgent, weight: 15 },
            { processor: ReapSolutionsAgent, weight: 10 },
            { processor: CreateSolutionImagesAgent, weight: 10 },
            { processor: RankProsConsAgent, weight: 10 },
        ];
    }
}
//# sourceMappingURL=solutionsEvolution.js.map