# ReduceSubProblemsProcessor

This class extends `BaseProblemSolvingAgent` to specifically handle the reduction of sub-problems from a given set of problems. It filters, processes, and prepares sub-problems for further analysis or solution.

## Methods

| Name                  | Parameters                                      | Return Type         | Description |
|-----------------------|-------------------------------------------------|---------------------|-------------|
| renderSelectPrompt    | problemStatement: string, subProblemsToConsider: IEngineSubProblem[] | Promise<HumanMessage[]> | Generates a prompt for selecting sub-problems from a list, formatted for human understanding. |
| reduceSubProblems     | subProblemsToConsider: IEngineSubProblem[]      | void                | Processes the list of sub-problems by removing unnecessary properties and preparing them for further processing. |
| process               | -                                               | Promise<void>       | Orchestrates the sub-problem reduction process by setting up the environment, filtering sub-problems based on criteria, and invoking the reduction method. |

## Example

```typescript
// Example usage of ReduceSubProblemsProcessor
import { ReduceSubProblemsProcessor } from '@policysynth/agents/problems/create/reduceSubProblems.js';

async function main() {
  const processor = new ReduceSubProblemsProcessor();
  const problemStatement = "Define the main challenges in achieving AI safety.";
  const subProblemsToConsider = [
    { title: "Understanding AI alignment", description: "Explore how AI goals can be aligned with human values.", whyIsSubProblemImportant: "Key for safe AI deployment", fromSearchType: "academic" },
    // more sub problems...
  ];

  const messages = await processor.renderSelectPrompt(problemStatement, subProblemsToConsider);
  console.log(messages);

  await processor.process();
}

main();
```