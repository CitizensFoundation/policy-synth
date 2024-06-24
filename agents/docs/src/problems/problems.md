# AgentProblems

The `AgentProblems` class is responsible for processing various stages of problem-solving tasks using different processors. It extends the `BaseAgentProcessor` class and utilizes the `bullmq` library for job processing.

## Properties

| Name          | Type                | Description               |
|---------------|---------------------|---------------------------|
| memory        | PsSmarterCrowdsourcingMemoryData    | The memory data for the agent. |

## Methods

| Name             | Parameters                | Return Type | Description                                                                 |
|------------------|---------------------------|-------------|-----------------------------------------------------------------------------|
| initializeMemory | job: Job                  | Promise<void> | Initializes the memory for the agent using job data.                        |
| setStage         | stage: PsScMemoryStageTypes | Promise<void> | Sets the current stage and updates the memory.                              |
| processSubProblems |                         | Promise<void> | Processes sub-problems using the `CreateSubProblemsProcessor`.              |
| process          |                           | Promise<void> | Processes the current stage using the appropriate processor.                |

## Example

```typescript
// Example usage of AgentProblems
import { AgentProblems } from '@policysynth/agents/problems/problems.js';
import { Job } from 'bullmq';

const job = new Job('example-job', { /* job data */ });
const agent = new AgentProblems();

agent.initializeMemory(job).then(() => {
  agent.process();
});
```

This class handles various stages of problem-solving by delegating tasks to specific processors based on the current stage. It uses a memory object to keep track of the current state and progress. The `process` method switches between different stages and invokes the corresponding processor to handle the task.