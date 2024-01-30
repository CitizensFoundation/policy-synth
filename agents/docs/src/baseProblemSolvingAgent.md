# BaseProblemSolvingAgent

This class is an abstract base class for problem-solving agents, extending the functionality of `PolicySynthAgentBase`. It includes methods for processing and rendering information about problems, sub-problems, solutions, and entities based on the agent's memory.

## Properties

| Name                   | Type                        | Description                                      |
|------------------------|-----------------------------|--------------------------------------------------|
| memory                 | PsBaseMemoryData            | The memory of the agent, containing problem-solving data. |
| job                    | Job                         | The job associated with the agent's current task. |
| currentSubProblemIndex | number \| undefined         | The index of the current sub-problem the agent is focusing on. |

## Methods

| Name                                  | Parameters                                      | Return Type            | Description                                                                 |
|---------------------------------------|-------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| getProCons                            | prosCons: IEngineProCon[] \| undefined          | string[]               | Returns descriptions of provided pros and cons.                            |
| process                               |                                                 | Promise<void>          | Processes the current task, throwing an error if memory is not initialized. |
| lastPopulationIndex                   | subProblemIndex: number                         | number                 | Returns the index of the last population for a given sub-problem.           |
| renderSubProblem                      | subProblemIndex: number, useProblemAsHeader: boolean = false | string                 | Renders a detailed view of a sub-problem.                                  |
| renderSubProblemSimple                | subProblemIndex: number                         | string                 | Renders a simplified view of a sub-problem.                                |
| getActiveSolutionsLastPopulation      | subProblemIndex: number                         | any[]                  | Returns active solutions from the last population of a sub-problem.         |
| getActiveSolutionsFromPopulation      | subProblemIndex: number, populationIndex: number | any[]                  | Returns active solutions from a specified population of a sub-problem.      |
| numberOfPopulations                   | subProblemIndex: number                         | number                 | Returns the number of populations for a given sub-problem.                  |
| renderSubProblems                     |                                                 | string                 | Renders a view of all sub-problems.                                        |
| renderEntity                          | subProblemIndex: number, entityIndex: number    | string                 | Renders a view of a specific entity within a sub-problem.                   |
| renderProblemStatement                |                                                 | string                 | Renders the problem statement.                                             |
| renderProblemStatementSubProblemsAndEntities | index: number                                 | string                 | Renders the problem statement along with sub-problems and entities.         |
| renderEntityPosNegReasons             | item: IEngineAffectedEntity                     | string                 | Renders positive and negative effects of an entity.                         |

## Example

```typescript
import { BaseProblemSolvingAgent } from '@policysynth/agents/baseProblemSolvingAgent.js';
import { Job } from "bullmq";
import { PsBaseMemoryData, IEngineProCon, IEngineAffectedEntity } from "./path/to/types";

class CustomProblemSolvingAgent extends BaseProblemSolvingAgent {
  constructor(job: Job, memory: PsBaseMemoryData) {
    super(job, memory);
  }

  // Implement abstract methods and any additional functionality
}

// Example usage
const job = new Job(); // Assuming Job is properly instantiated
const memory: PsBaseMemoryData = {/* Memory data structure */};
const agent = new CustomProblemSolvingAgent(job, memory);

// Example method usage
agent.process().then(() => {
  console.log("Processing complete.");
}).catch(error => {
  console.error("Processing failed:", error);
});
```