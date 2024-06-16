# EvolvePopulationProcessor

This class extends `CreateSolutionsProcessor` and is responsible for evolving a population of solutions through genetic algorithm techniques such as mutation, recombination, and selection.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| chat          | ChatOpenAI | Instance of ChatOpenAI used for interacting with OpenAI's API. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| renderSolution | solution: PsSolution | string | Converts a solution object into a JSON string. |
| renderRecombinationPrompt | parentA: PsSolution, parentB: PsSolution, subProblemIndex: number | SystemMessage[], HumanMessage[] | Generates prompts for recombination of two parent solutions. |
| renderMutatePrompt | individual: PsSolution, subProblemIndex: number, mutateRate: PsMutationRates | SystemMessage[], HumanMessage[] | Generates prompts for mutating a solution. |
| performRecombination | parentA: PsSolution, parentB: PsSolution, subProblemIndex: number | Promise<PsSolution> | Performs recombination of two parent solutions using a language model. |
| recombine | parentA: PsSolution, parentB: PsSolution, subProblemIndex: number | Promise<PsSolution> | Facilitates the recombination process and returns the offspring. |
| performMutation | individual: PsSolution, subProblemIndex: number, mutateRate: PsMutationRates | Promise<PsSolution> | Mutates a given solution based on the specified mutation rate. |
| mutate | individual: PsSolution, subProblemIndex: number, mutateRate: PsMutationRates | Promise<PsSolution> | Facilitates the mutation process and returns the mutated solution. |
| getNewSolutions | alreadyCreatedSolutions: PsSolution[], subProblemIndex: number | Promise<PsSolution[]> | Generates new solutions based on existing solutions and various data sources. |
| selectParent | population: PsSolution[], excludedIndividual?: PsSolution | PsSolution | Selects a parent for genetic operations from a population, optionally excluding a specific individual. |
| getNumberOfGenerations | subProblemIndex: number | number | Retrieves the number of generations for a specific sub-problem. |
| getPreviousPopulation | subProblemIndex: number | PsSolution[] | Retrieves the previous population of solutions for a specific sub-problem. |
| getIndexOfParent | parent: PsSolution, previousPopulation: PsSolution[] | number \| undefined | Finds the index of a parent solution in the previous population. |
| addRandomMutation | newPopulation: PsSolution[], previousPopulation: PsSolution[], subProblemIndex: number | Promise<void> | Adds random mutations to the new population. |
| addCrossover | newPopulation: PsSolution[], previousPopulation: PsSolution[], subProblemIndex: number | Promise<void> | Performs crossover operations to generate offspring for the new population. |
| addRandomImmigration | newPopulation: PsSolution[], subProblemIndex: number | Promise<void> | Adds new solutions to the population through an immigration process. |
| addUniqueAboveAverageSolutionAsElite | previousPopulation: PsSolution[], newPopulation: PsSolution[], usedSolutionTitles: Set<string> | void | Adds unique and above-average solutions as elites to the new population. |
| addElites | previousPopulation: PsSolution[], newPopulation: PsSolution[], usedSolutionTitles: Set<string> | void | Adds elite solutions from the previous population to the new population. |
| pruneTopicClusters | solutions: Array<PsSolution> | Array<PsSolution> | Prunes solutions based on topic clusters to maintain diversity. |
| evolveSubProblem | subProblemIndex: number | Promise<void> | Evolves the population for a specific sub-problem. |
| evolvePopulation |  | Promise<void> | Evolves the population across all sub-problems. |
| process |  | Promise<void> | Initiates the process of evolving the population. |

## Example

```typescript
import { EvolvePopulationProcessor } from '@policysynth/agents/solutions/evolve/evolvePopulation.js';

const processor = new EvolvePopulationProcessor();
processor.process().then(() => {
  console.log("Population evolution complete.");
}).catch(error => {
  console.error("Error during population evolution:", error);
});
```