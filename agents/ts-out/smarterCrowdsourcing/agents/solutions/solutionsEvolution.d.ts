import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { RankSolutionsAgent } from "./ranking/rankSolutions.js";
import { EvolvePopulationAgent } from "./evolve/evolvePopulation.js";
import { CreateSolutionImagesAgent } from "./create/createImages.js";
import { ReapSolutionsAgent } from "./evolve/reapPopulation.js";
import { GroupSolutionsAgent } from "./group/groupSolutions.js";
import { RankProsConsAgent } from "./ranking/rankProsCons.js";
import { CreateInitialSolutionsAgent } from "./create/createSolutions.js";
import { CreateProsConsAgent } from "./create/createProsCons.js";
export declare class SolutionsEvolutionAgentQueue extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_solutions_evolution";
    process(): Promise<void>;
    get processors(): ({
        processor: typeof CreateInitialSolutionsAgent;
        weight: number;
    } | {
        processor: typeof CreateProsConsAgent;
        weight: number;
    } | {
        processor: typeof RankProsConsAgent;
        weight: number;
    } | {
        processor: typeof RankSolutionsAgent;
        weight: number;
    } | {
        processor: typeof GroupSolutionsAgent;
        weight: number;
    } | {
        processor: typeof CreateSolutionImagesAgent;
        weight: number;
    })[] | ({
        processor: typeof EvolvePopulationAgent;
        weight: number;
    } | {
        processor: typeof ReapSolutionsAgent;
        weight: number;
    } | {
        processor: typeof CreateProsConsAgent;
        weight: number;
    } | {
        processor: typeof RankProsConsAgent;
        weight: number;
    } | {
        processor: typeof RankSolutionsAgent;
        weight: number;
    } | {
        processor: typeof GroupSolutionsAgent;
        weight: number;
    } | {
        processor: typeof CreateSolutionImagesAgent;
        weight: number;
    })[];
}
//# sourceMappingURL=solutionsEvolution.d.ts.map