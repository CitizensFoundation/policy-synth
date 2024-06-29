import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { RankSolutionsProcessor } from "./ranking/rankSolutions.js";
import { EvolvePopulationProcessor } from "./evolve/evolvePopulation.js";
import { CreateSolutionImagesProcessor } from "./create/createImages.js";
import { ReapSolutionsProcessor } from "./evolve/reapPopulation.js";
import { RateSolutionsProcessor } from "./ranking/rateSolutions.js";
import { GroupSolutionsProcessor } from "./group/groupSolutions.js";
import { RankProsConsProcessor } from "./ranking/rankProsCons.js";
export declare class SolutionsEvolutionAgent extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_solutions_evolution";
    process(): Promise<void>;
    get processors(): ({
        processor: typeof RankSolutionsProcessor;
        weight: number;
    } | {
        processor: typeof RateSolutionsProcessor;
        weight: number;
    } | {
        processor: typeof GroupSolutionsProcessor;
        weight: number;
    } | {
        processor: typeof EvolvePopulationProcessor;
        weight: number;
    } | {
        processor: typeof ReapSolutionsProcessor;
        weight: number;
    } | {
        processor: typeof CreateSolutionImagesProcessor;
        weight: number;
    } | {
        processor: typeof RankProsConsProcessor;
        weight: number;
    })[];
}
//# sourceMappingURL=solutionsEvolution.d.ts.map