# EvolvePopulationProcessor

This class extends the `CreateSolutionsProcessor` to implement the functionality for evolving a population of solutions. It includes methods for rendering solutions, performing recombination and mutation of solutions, and evolving the population for a sub-problem.

## Properties

No properties are explicitly defined in this class beyond those inherited from `CreateSolutionsProcessor`.

## Methods

| Name                              | Parameters                                                                                   | Return Type                        | Description                                                                                   |
|-----------------------------------|----------------------------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| renderSolution                    | solution: IEngineSolution                                                                    | string                             | Renders a solution as a JSON string.                                                          |
| renderRecombinationPrompt         | parentA: IEngineSolution, parentB: IEngineSolution, subProblemIndex: number                  | SystemMessage[], HumanMessage[]    | Prepares the prompt for recombination of two parent solutions.                                |
| renderMutatePrompt                | individual: IEngineSolution, subProblemIndex: number, mutateRate: IEngineMutationRates      | SystemMessage[], HumanMessage[]    | Prepares the prompt for mutating a solution.                                                  |
| performRecombination              | parentA: IEngineSolution, parentB: IEngineSolution, subProblemIndex: number                  | Promise<IEngineSolution>           | Performs the recombination of two parent solutions to produce an offspring.                   |
| recombine                         | parentA: IEngineSolution, parentB: IEngineSolution, subProblemIndex: number                  | Promise<IEngineSolution>           | Initiates the recombination process and returns the offspring.                                |
| performMutation                   | individual: IEngineSolution, subProblemIndex: number, mutateRate: IEngineMutationRates      | Promise<IEngineSolution>           | Performs mutation on a solution.                                                              |
| mutate                            | individual: IEngineSolution, subProblemIndex: number, mutateRate: IEngineMutationRates      | Promise<IEngineSolution>           | Initiates the mutation process and returns the mutated solution.                              |
| getNewSolutions                   | alreadyCreatedSolutions: IEngineSolution[], subProblemIndex: number                         | Promise<IEngineSolution[]>         | Generates new solutions for a sub-problem.                                                    |
| selectParent                      | population: IEngineSolution[], excludedIndividual?: IEngineSolution                         | IEngineSolution                    | Selects a parent solution from the population for recombination or mutation.                  |
| getNumberOfGenerations            | subProblemIndex: number                                                                     | number                             | Returns the number of generations for a sub-problem.                                          |
| getPreviousPopulation             | subProblemIndex: number                                                                     | IEngineSolution[]                  | Retrieves the previous population for a sub-problem.                                          |
| getIndexOfParent                  | parent: IEngineSolution, previousPopulation: IEngineSolution[]                              | number \| undefined                | Finds the index of a parent solution in the previous population.                              |
| addRandomMutation                 | newPopulation: IEngineSolution[], previousPopulation: IEngineSolution[], subProblemIndex: number | Promise<void>                     | Adds random mutations to the new population.                                                  |
| addCrossover                      | newPopulation: IEngineSolution[], previousPopulation: IEngineSolution[], subProblemIndex: number | Promise<void>                     | Performs crossover to generate offspring for the new population.                              |
| addRandomImmigration              | newPopulation: IEngineSolution[], subProblemIndex: number                                    | Promise<void>                     | Adds new solutions to the population through random immigration.                              |
| addUniqueAboveAverageSolutionAsElite | previousPopulation: IEngineSolution[], newPopulation: IEngineSolution[], usedSolutionTitles: Set<string> | void                             | Adds unique above-average solutions as elites to the new population.                          |
| addElites                         | previousPopulation: IEngineSolution[], newPopulation: IEngineSolution[], usedSolutionTitles: Set<string> | void                             | Adds elite solutions from the previous population to the new population.                      |
| pruneTopicClusters                | solutions: Array<IEngineSolution>                                                           | Array<IEngineSolution>             | Prunes solutions based on topic clusters to maintain diversity.                               |
| evolveSubProblem                  | subProblemIndex: number                                                                     | Promise<void>                     | Evolves the population for a specific sub-problem.                                            |
| evolvePopulation                  |                                                                                              | Promise<void>                     | Evolves the population for all sub-problems within the defined limits.                        |
| process                           |                                                                                              | Promise<void>                     | Initiates the process of evolving the population.                                             |

## Example

```javascript
// Example usage of EvolvePopulationProcessor
import { EvolvePopulationProcessor } from '@policysynth/agents/solutions/evolve/evolvePopulation.js';

const processor = new EvolvePopulationProcessor();
processor.process().then(() => {
  console.log('Population evolution process completed.');
}).catch(error => {
  console.error('Error during population evolution:', error);
});
```