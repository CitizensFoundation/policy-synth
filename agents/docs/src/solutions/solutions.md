# AgentSolutions

AgentSolutions extends the functionality of BaseAgentProcessor to handle various stages of processing solutions, including creating, ranking, grouping, and evolving solutions based on the current stage stored in memory.

## Properties

| Name    | Type                                      | Description |
|---------|-------------------------------------------|-------------|
| memory  | PsBaseMemoryData               | Holds the current state and data of the processing job, including stages, problem statements, and other relevant information. |

## Methods

| Name              | Parameters            | Return Type | Description |
|-------------------|-----------------------|-------------|-------------|
| initializeMemory  | job: Job              | Promise<void> | Initializes the memory property with job data and sets up the initial state for processing. |
| setStage          | stage: PsMemoryStageTypes | Promise<void> | Updates the current stage in memory and records the start time for the stage. |
| process           | None                  | Promise<void> | Processes the current stage by instantiating and invoking the appropriate processor based on the current stage. |

## Example

```javascript
// Example usage of AgentSolutions
import { Worker, Job } from "bullmq";
import { AgentSolutions } from '@policysynth/agents/solutions/solutions.js';

const agent = new Worker(
  "agent-solutions",
  async (job: Job) => {
    console.log(`Agent Solutions Processing job ${job.id}`);
    const agent = new AgentSolutions();
    await agent.setup(job);
    await agent.process();
    return job.data;
  },
  { concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1") }
);

process.on("SIGINT", async () => {
  await agent.close();
});
```