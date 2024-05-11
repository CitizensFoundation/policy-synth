# AgentProblems

This class extends `BaseAgentProcessor` to handle various stages of problem processing in a policy synthesis context.

## Properties

| Name    | Type             | Description               |
|---------|------------------|---------------------------|
| memory  | PsBaseMemoryData | Holds the state and data specific to the agent's current task. |

## Methods

| Name              | Parameters            | Return Type | Description                                           |
|-------------------|-----------------------|-------------|-------------------------------------------------------|
| initializeMemory  | job: Job              | Promise<void> | Initializes the memory with job-specific data.       |
| setStage          | stage: PsMemoryStageTypes | Promise<void> | Sets the current stage of processing and updates the start time. |
| processSubProblems|                       | Promise<void> | Processes sub-problems by creating them.             |
| process           |                       | Promise<void> | Main processing function that handles different stages based on the current memory stage. |

## Example

```typescript
import { AgentProblems } from '@policysynth/agents/problems/problems.js';
import { Job } from "bullmq";

const job = new Job(); // Assuming job is already defined and configured elsewhere
const agentProblems = new AgentProblems();

// Example of initializing and processing a job
(async () => {
  await agentProblems.initializeMemory(job);
  await agentProblems.process();
})();
```