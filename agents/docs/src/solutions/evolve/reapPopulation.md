# ReapSolutionsProcessor

Extends `BaseProblemSolvingAgent` to process and reap solutions based on specific requirements.

## Properties

No public properties documented.

## Methods

| Name                        | Parameters                                      | Return Type            | Description                                                                 |
|-----------------------------|-------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| renderReapPrompt            | solution: IEngineSolution                       | Promise<SystemMessage[]> | Prepares the prompt for reaping by generating system and human messages.    |
| reapSolutionsForSubProblem  | subProblemIndex: number, solutions: Array<IEngineSolution> | Promise<void>          | Processes and flags solutions for a specific subproblem based on reaping criteria. |
| reapSolutions               | None                                            | Promise<void>          | Iterates over subproblems to reap solutions across all.                     |
| process                     | None                                            | Promise<void>          | Initiates the reaping process for solution components.                      |

## Example

```javascript
// Example usage of ReapSolutionsProcessor
import { ReapSolutionsProcessor } from '@policysynth/agents/solutions/evolve/reapPopulation.js';

const reapProcessor = new ReapSolutionsProcessor();

// Assuming `solution` is an IEngineSolution object and `subProblemIndex` is the index of the current subproblem
reapProcessor.renderReapPrompt(solution).then(messages => {
  console.log(messages);
});

// To reap solutions for a specific subproblem
reapProcessor.reapSolutionsForSubProblem(subProblemIndex, solutions);

// To start the reaping process across all subproblems
reapProcessor.reapSolutions();

// To process and handle the entire reaping operation
reapProcessor.process().then(() => {
  console.log('Reaping process completed.');
}).catch(error => {
  console.error('Error during reaping process:', error);
});
```