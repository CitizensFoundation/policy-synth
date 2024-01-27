# BaseProlemSolvingAgent

This class is an abstract base class for problem-solving agents, extending the functionality of `PolicySynthAgentBase`. It is designed to handle and process sub-problems, solutions, and entities related to a given problem, utilizing a memory structure to store and manipulate this information.

## Properties

| Name                   | Type                                      | Description                                      |
|------------------------|-------------------------------------------|--------------------------------------------------|
| memory                 | PsBaseMemoryData               | The memory structure containing problem details. |
| job                    | Job                                       | The job instance associated with the agent.      |
| currentSubProblemIndex | number \| undefined                       | The index of the current sub-problem being processed. |

## Methods

| Name                                  | Parameters                                      | Return Type                  | Description                                                                                   |
|---------------------------------------|-------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| getProCons                            | prosCons: IEngineProCon[] \| undefined          | string[]                     | Returns descriptions of provided pros and cons.                                               |
| process                               |                                                 | Promise<void>                | Processes the current problem, throwing an error if memory is not initialized.                |
| lastPopulationIndex                   | subProblemIndex: number                         | number                       | Returns the index of the last population for a given sub-problem.                            |
| renderSubProblem                      | subProblemIndex: number, useProblemAsHeader: boolean | string                       | Renders a detailed view of a sub-problem, optionally using "Problem" as the header.           |
| renderSubProblemSimple                | subProblemIndex: number                         | string                       | Renders a simplified view of a sub-problem.                                                  |
| getActiveSolutionsLastPopulation      | subProblemIndex: number                         | IEngineSolution[]            | Returns active solutions from the last population of a given sub-problem.                    |
| getActiveSolutionsFromPopulation      | subProblemIndex: number, populationIndex: number | IEngineSolution[]            | Returns active solutions from a specified population of a given sub-problem.                 |
| numberOfPopulations                   | subProblemIndex: number                         | number                       | Returns the number of populations for a given sub-problem.                                   |
| renderSubProblems                     |                                                 | string                       | Renders a detailed view of all sub-problems.                                                 |
| renderEntity                          | subProblemIndex: number, entityIndex: number    | string                       | Renders a detailed view of an entity associated with a sub-problem.                          |
| renderProblemStatement                |                                                 | string                       | Renders the problem statement.                                                               |
| renderProblemStatementSubProblemsAndEntities | index: number                                 | string                       | Renders the problem statement along with details of a sub-problem and its top affected entities. |
| renderEntityPosNegReasons             | item: IEngineAffectedEntity                     | string                       | Renders positive and negative effects associated with an entity.                             |

## Example

```
// Example usage of BaseProlemSolvingAgent
import { BaseProlemSolvingAgent } from '@policysynth/agents/baseProblemSolvingAgent.js';

class CustomProblemSolvingAgent extends BaseProlemSolvingAgent {
  constructor(job, memory) {
    super(job, memory);
  }

  async process() {
    // Custom processing logic here
  }
}

// Assuming job and memory are already defined
const agent = new CustomProblemSolvingAgent(job, memory);
agent.process();
```