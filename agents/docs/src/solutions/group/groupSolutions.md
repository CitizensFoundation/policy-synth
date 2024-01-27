# GroupSolutionsProcessor

This class extends `BaseProlemSolvingAgent` to process and group solutions based on their core ideas using a language model.

## Methods

| Name                             | Parameters                                                                 | Return Type            | Description                                                                                   |
|----------------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| renderGroupPrompt                | solutionsToGroup: IEngineSolutionForGroupCheck[]                          | Promise<SystemMessage[]> | Prepares the prompt for the language model to group solutions.                                |
| groupSolutionsForSubProblem      | subProblemIndex: number, solutions: Array<IEngineSolution>                | Promise<void>          | Groups solutions for a specific sub-problem based on their core ideas.                        |
| calculateGroupStats              | solutions: Array<IEngineSolution>                                         | Promise<void>          | Calculates statistics for the grouped solutions, such as total groups and ungrouped solutions.|
| groupSolutions                   | None                                                                     | Promise<void>          | Groups solutions across all sub-problems.                                                     |
| process                          | None                                                                     | Promise<void>          | Initiates the process of grouping solution components.                                         |

## Example

```javascript
// Example usage of GroupSolutionsProcessor
import { GroupSolutionsProcessor } from '@policysynth/agents/solutions/group/groupSolutions.js';

const groupSolutionsProcessor = new GroupSolutionsProcessor();

groupSolutionsProcessor.process()
  .then(() => {
    console.log('Grouping of solutions completed.');
  })
  .catch(error => {
    console.error('An error occurred during the grouping process:', error);
  });
```