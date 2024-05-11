# GroupSolutionsProcessor

This class processes and groups solutions based on their core ideas using a language model, extending the capabilities of `BaseProblemSolvingAgent`.

## Methods

| Name                               | Parameters                                             | Return Type      | Description                                                                 |
|------------------------------------|--------------------------------------------------------|------------------|-----------------------------------------------------------------------------|
| renderGroupPrompt                  | solutionsToGroup: IEngineSolutionForGroupCheck[]       | Promise<SystemMessage[]> | Prepares the prompt for the language model to group solutions.              |
| groupSolutionsForSubProblem        | subProblemIndex: number, solutions: IEngineSolution[]  | Promise<void>    | Groups solutions for a specific subproblem.                                 |
| calculateGroupStats                | solutions: IEngineSolution[]                           | Promise<void>    | Calculates statistics for the grouped solutions.                            |
| groupSolutions                     | -                                                      | Promise<void>    | Groups solutions for all subproblems up to a specified limit.               |
| process                            | -                                                      | Promise<void>    | Processes the grouping of solution components using a language model.       |

## Example

```typescript
// Example usage of GroupSolutionsProcessor
import { GroupSolutionsProcessor } from '@policysynth/agents/solutions/group/groupSolutions.js';

const processor = new GroupSolutionsProcessor();
processor.process().then(() => {
  console.log("Grouping completed.");
}).catch(error => {
  console.error("Error during grouping:", error);
});
```