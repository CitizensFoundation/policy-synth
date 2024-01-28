# AgentSolutions

AgentSolutions extends BaseAgentProcessor to handle various stages of solution processing, including creating, ranking, grouping, and evolving solutions based on problem statements.

## Properties

| Name    | Type                | Description |
|---------|---------------------|-------------|
| memory  | PsBaseMemoryData    | Holds the current state and data of the processing agent. |

## Methods

| Name              | Parameters            | Return Type | Description |
|-------------------|-----------------------|-------------|-------------|
| initializeMemory  | job: Job              | Promise<void> | Initializes the memory for the agent with the job data. |
| setStage          | stage: PsMemoryStageTypes | Promise<void> | Sets the current stage of processing and updates the memory. |
| process           | None                  | Promise<void> | Processes the current stage based on the memory's currentStage. |

## Example

```typescript
import { Job } from "bullmq";
import { AgentSolutions } from '@policysynth/agents/solutions/solutions.js';

const job: Job = /* Job instance with necessary data */;
const agentSolutions = new AgentSolutions();

(async () => {
  await agentSolutions.setup(job);
  await agentSolutions.process();
})();
```