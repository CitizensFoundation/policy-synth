# AgentProblems

AgentProblems extends BaseAgentProcessor to handle various stages of problem-solving processes, including creating sub-problems, entities, search queries, ranking entities, search queries, search results, and more.

## Properties

| Name    | Type                                      | Description |
|---------|-------------------------------------------|-------------|
| memory  | IEngineInnovationMemoryData              | Holds the state and data relevant to the current job being processed. |

## Methods

| Name                  | Parameters            | Return Type | Description |
|-----------------------|-----------------------|-------------|-------------|
| initializeMemory      | job: Job              | Promise<void> | Initializes the memory with job data and sets the current stage to "create-sub-problems". |
| setStage              | stage: IEngineStageTypes | Promise<void> | Sets the current stage in the memory and updates the start time for the stage. |
| processSubProblems    | None                  | Promise<void> | Processes the creation of sub-problems. |
| process               | None                  | Promise<void> | Main processing function that handles the logic for transitioning between different stages of problem processing based on the current stage in memory. |

## Example

```javascript
// Example usage of AgentProblems
import { Job } from "bullmq";
import { AgentProblems } from '@policysynth/agents/problems/problems.js';

const job = new Job(); // Assuming job is already defined and contains necessary data
const agentProblems = new AgentProblems();

(async () => {
  await agentProblems.setup(job);
  await agentProblems.process();
})();
```