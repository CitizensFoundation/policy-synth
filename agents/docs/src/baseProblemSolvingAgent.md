# BaseProblemSolvingAgent

This class extends `PolicySynthAgentBase` and provides methods for processing and rendering problem-solving tasks related to policy synthesis.

## Properties

| Name                  | Type                        | Description                                   |
|-----------------------|-----------------------------|-----------------------------------------------|
| memory                | PsBaseMemoryData            | Memory storage for problem-solving data.      |
| job                   | Job                         | Job instance from bullmq.                     |
| currentSubProblemIndex| number \| undefined         | Index of the current sub-problem being solved.|

## Methods

| Name                                  | Parameters                                      | Return Type | Description                                                                 |
|---------------------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| getProCons                            | prosCons: PsProCon[] \| undefined          | string[]    | Returns descriptions of provided pros and cons.                             |
| process                               |                                                 | Promise<void>| Processes the current job, throws if memory is not initialized.             |
| lastPopulationIndex                   | subProblemIndex: number                         | number      | Returns the index of the last population for a given sub-problem.           |
| renderSubProblem                      | subProblemIndex: number, useProblemAsHeader: boolean = false | string      | Renders a detailed view of a sub-problem.                                   |
| renderSubProblemSimple                | subProblemIndex: number                         | string      | Renders a simplified view of a sub-problem.                                 |
| getActiveSolutionsLastPopulation      | subProblemIndex: number                         | any[]       | Returns active solutions from the last population of a sub-problem.         |
| getActiveSolutionsFromPopulation      | subProblemIndex: number, populationIndex: number| any[]       | Returns active solutions from a specified population of a sub-problem.      |
| numberOfPopulations                   | subProblemIndex: number                         | number      | Returns the number of populations for a given sub-problem.                  |
| renderSubProblems                     |                                                 | string      | Renders all sub-problems.                                                   |
| renderEntity                          | subProblemIndex: number, entityIndex: number    | string      | Renders details of a specific entity within a sub-problem.                  |
| renderProblemStatement                |                                                 | string      | Renders the problem statement.                                              |
| renderProblemStatementSubProblemsAndEntities | index: number                            | string      | Renders the problem statement along with sub-problems and top entities.     |
| renderEntityPosNegReasons             | item: PsAffectedEntity                     | string      | Renders positive and negative effects associated with an entity.            |

## Example

```typescript
import { BaseProblemSolvingAgent } from '@policysynth/agents/baseProblemSolvingAgent.js';

// Example usage of BaseProblemSolvingAgent
const job = new Job(); // Assuming Job is properly instantiated
const memory = {
  subProblems: [
    {
      title: "Sub Problem 1",
      description: "Description of Sub Problem 1",
      solutions: {
        populations: [
          [{ solution: "Solution 1", reaped: false }]
        ]
      },
      entities: [
        {
          name: "Entity 1",
          positiveEffects: ["Positive effect 1"],
          negativeEffects: ["Negative effect 1"]
        }
      ]
    }
  ],
  problemStatement: {
    description: "Main problem description"
  }
};

const agent = new BaseProblemSolvingAgent(job, memory);
console.log(agent.renderProblemStatement());
```
