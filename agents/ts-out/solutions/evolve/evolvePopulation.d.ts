import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { CreateSolutionsProcessor } from "../create/createSolutions.js";
export declare class EvolvePopulationProcessor extends CreateSolutionsProcessor {
    renderSolution(solution: IEngineSolution): string;
    renderRecombinationPrompt(parentA: IEngineSolution, parentB: IEngineSolution, subProblemIndex: number): (HumanMessage | SystemMessage)[];
    renderMutatePrompt(individual: IEngineSolution, subProblemIndex: number, mutateRate: IEngineMutationRates): (HumanMessage | SystemMessage)[];
    performRecombination(parentA: IEngineSolution, parentB: IEngineSolution, subProblemIndex: number): Promise<IEngineSolution>;
    recombine(parentA: IEngineSolution, parentB: IEngineSolution, subProblemIndex: number): Promise<IEngineSolution>;
    performMutation(individual: IEngineSolution, subProblemIndex: number, mutateRate: IEngineMutationRates): Promise<IEngineSolution>;
    mutate(individual: IEngineSolution, subProblemIndex: number, mutateRate: IEngineMutationRates): Promise<IEngineSolution>;
    getNewSolutions(alreadyCreatedSolutions: IEngineSolution[], subProblemIndex: number): Promise<IEngineSolution[]>;
    selectParent(population: IEngineSolution[], excludedIndividual?: IEngineSolution): IEngineSolution;
    getNumberOfGenerations(subProblemIndex: number): number;
    getPreviousPopulation(subProblemIndex: number): IEngineSolution[];
    getIndexOfParent(parent: IEngineSolution, previousPopulation: IEngineSolution[]): number | undefined;
    addRandomMutation(newPopulation: IEngineSolution[], previousPopulation: IEngineSolution[], subProblemIndex: number): Promise<void>;
    addCrossover(newPopulation: IEngineSolution[], previousPopulation: IEngineSolution[], subProblemIndex: number): Promise<void>;
    addRandomImmigration(newPopulation: IEngineSolution[], subProblemIndex: number): Promise<void>;
    addUniqueAboveAverageSolutionAsElite(previousPopulation: IEngineSolution[], newPopulation: IEngineSolution[], usedSolutionTitles: Set<string>): void;
    addElites(previousPopulation: IEngineSolution[], newPopulation: IEngineSolution[], usedSolutionTitles: Set<string>): void;
    pruneTopicClusters(solutions: Array<IEngineSolution>): Array<IEngineSolution>;
    evolveSubProblem(subProblemIndex: number): Promise<void>;
    evolvePopulation(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=evolvePopulation.d.ts.map