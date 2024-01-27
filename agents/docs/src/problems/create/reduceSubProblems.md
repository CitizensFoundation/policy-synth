# ReduceSubProblemsProcessor

This class extends `BaseProlemSolvingAgent` to process and reduce sub-problems from a given problem statement. It interacts with a language model to filter and refine sub-problems based on certain criteria.

## Methods

| Name                  | Parameters                                      | Return Type            | Description                                                                                   |
|-----------------------|-------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| renderSelectPrompt    | problemStatement: string, subProblemsToConsider: IEngineSubProblem[] | Promise<HumanMessage[]> | Generates prompts for selecting sub-problems from a list.                                     |
| reduceSubProblems     | subProblemsToConsider: IEngineSubProblem[]      | void                   | Filters and processes sub-problems to meet specific criteria, updating the agent's memory.    |
| process               | None                                            | void                   | Orchestrates the reduction of sub-problems by filtering and refining them through a chat model. |

## Example

```javascript
// Example usage of ReduceSubProblemsProcessor
import { ReduceSubProblemsProcessor } from '@policysynth/agents/problems/create/reduceSubProblems.js';

const processor = new ReduceSubProblemsProcessor();

// Assuming `problemStatement` and `subProblemsToConsider` are defined
processor.renderSelectPrompt(problemStatement, subProblemsToConsider)
  .then(messages => {
    // Use the generated messages as needed
  });

// To start the process of reducing sub-problems
processor.process();
```