# BaseProlemSolvingAgent

This class is an abstract class that extends `PolicySynthAgentBase` and is designed to solve problems by processing sub-problems, managing memory, and rendering various aspects of the problem-solving process.

## Properties

| Name                   | Type                                      | Description                                      |
|------------------------|-------------------------------------------|--------------------------------------------------|
| memory                 | IEngineInnovationMemoryData               | Memory data for the engine's innovation process. |
| job                    | Job                                       | The job instance associated with the agent.      |
| currentSubProblemIndex | number \| undefined                       | The index of the current sub-problem being processed. |

## Methods

| Name                                  | Parameters                                      | Return Type                  | Description                                                                                   |
|---------------------------------------|-------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| getProCons                            | prosCons: IEngineProCon[] \| undefined          | string[]                     | Returns descriptions of provided pros and cons.                                               |
| process                               |                                                 | Promise<void>                | Processes the current task. Throws an error if memory is not initialized.                     |
| lastPopulationIndex                   | subProblemIndex: number                         | number                       | Returns the index of the last population for a given sub-problem.                             |
| renderSubProblem                      | subProblemIndex: number, useProblemAsHeader: boolean | string                       | Renders a detailed view of a sub-problem.                                                     |
| renderSubProblemSimple                | subProblemIndex: number                         | string                       | Renders a simplified view of a sub-problem.                                                   |
| getActiveSolutionsLastPopulation      | subProblemIndex: number                         | IEngineSolution[]            | Returns active solutions from the last population of a given sub-problem.                     |
| getActiveSolutionsFromPopulation      | subProblemIndex: number, populationIndex: number | IEngineSolution[]            | Returns active solutions from a specified population of a given sub-problem.                  |
| numberOfPopulations                   | subProblemIndex: number                         | number                       | Returns the number of populations for a given sub-problem.                                    |
| renderSubProblems                     |                                                 | string                       | Renders a detailed view of all sub-problems.                                                  |
| renderEntity                          | subProblemIndex: number, entityIndex: number    | string                       | Renders details of an entity associated with a sub-problem.                                   |
| renderProblemStatement                |                                                 | string                       | Renders the problem statement.                                                                |
| renderProblemStatementSubProblemsAndEntities | index: number                                  | string                       | Renders the problem statement along with sub-problems and top affected entities.              |
| renderEntityPosNegReasons             | item: IEngineAffectedEntity                     | string                       | Renders positive and negative effects associated with an entity.                              |

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

const job = new Job(); // Assuming Job is properly instantiated
const memory = {}; // Assuming memory is properly structured
const agent = new CustomProblemSolvingAgent(job, memory);

agent.process().then(() => {
  console.log('Processing complete.');
}).catch((error) => {
  console.error('Processing failed:', error);
});
```