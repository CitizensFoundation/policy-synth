# ReapSolutionsProcessor

This class extends `BaseProblemSolvingAgent` to implement the functionality of reaping solutions based on specific requirements. It interacts with a language model to evaluate if a solution fits the given requirements and manages the population of solutions accordingly.

## Properties

No public properties are documented.

## Methods

| Name                        | Parameters                                      | Return Type       | Description                                                                 |
|-----------------------------|-------------------------------------------------|-------------------|-----------------------------------------------------------------------------|
| renderReapPrompt            | solution: IEngineSolution                       | Promise<SystemMessage[]> | Prepares the prompt messages for the language model based on the solution.  |
| reapSolutionsForSubProblem  | subProblemIndex: number, solutions: IEngineSolution[] | Promise<void>     | Processes each solution for a subproblem to determine if it should be reaped. |
| reapSolutions               | None                                            | Promise<void>     | Manages the reaping process for all subproblems.                            |
| process                     | None                                            | Promise<void>     | Overrides the base process method to initiate the reaping process.          |

## Example

```typescript
// Example usage of ReapSolutionsProcessor
import { ReapSolutionsProcessor } from '@policysynth/agents/solutions/evolve/reapPopulation.js';

const processor = new ReapSolutionsProcessor();

processor.process().then(() => {
  console.log("Reaping process completed.");
}).catch(error => {
  console.error("Error during reaping process:", error);
});
```