import { CreateInitialSolutionsAgent } from "../create/createSolutions.js";
export declare class EvolvePopulationAgent extends CreateInitialSolutionsAgent {
    renderSolution(solution: PsSolution): string;
    renderRecombinationPrompt(parentA: PsSolution, parentB: PsSolution, subProblemIndex: number): PsModelMessage[];
    renderMutatePrompt(individual: PsSolution, subProblemIndex: number, mutateRate: PsMutationRates): PsModelMessage[];
    performRecombination(parentA: PsSolution, parentB: PsSolution, subProblemIndex: number): Promise<PsSolution>;
    recombine(parentA: PsSolution, parentB: PsSolution, subProblemIndex: number): Promise<PsSolution>;
    performMutation(individual: PsSolution, subProblemIndex: number, mutateRate: PsMutationRates): Promise<PsSolution>;
    mutate(individual: PsSolution, subProblemIndex: number, mutateRate: PsMutationRates): Promise<PsSolution>;
    getNewSolutions(alreadyCreatedSolutions: PsSolution[], subProblemIndex: number): Promise<PsSolution[]>;
    selectParent(population: PsSolution[], excludedIndividual?: PsSolution): PsSolution;
    getNumberOfGenerations(subProblemIndex: number): number;
    getPreviousPopulation(subProblemIndex: number): PsSolution[];
    getIndexOfParent(parent: PsSolution, previousPopulation: PsSolution[]): number | undefined;
    addRandomMutation(newPopulation: PsSolution[], previousPopulation: PsSolution[], subProblemIndex: number): Promise<void>;
    addCrossover(newPopulation: PsSolution[], previousPopulation: PsSolution[], subProblemIndex: number): Promise<void>;
    addRandomImmigration(newPopulation: PsSolution[], subProblemIndex: number): Promise<void>;
    addUniqueAboveAverageSolutionAsElite(previousPopulation: PsSolution[], newPopulation: PsSolution[], usedSolutionTitles: Set<string>): void;
    addElites(previousPopulation: PsSolution[], newPopulation: PsSolution[], usedSolutionTitles: Set<string>): void;
    pruneTopicClusters(solutions: Array<PsSolution>): Array<PsSolution>;
    evolveSubProblem(subProblemIndex: number): Promise<void>;
    evolvePopulation(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=evolvePopulation.d.ts.map