# AgentProblems

This class extends `BaseAgentProcessor` to handle various stages of problem-solving processes, including creating sub-problems, entities, search queries, ranking entities, search queries, search results, and processing web data for root causes.

## Properties

| Name    | Type                | Description |
|---------|---------------------|-------------|
| memory  | PsBaseMemoryData    | Holds the state and data required for processing the current job. |

## Methods

| Name                  | Parameters            | Return Type | Description |
|-----------------------|-----------------------|-------------|-------------|
| initializeMemory      | job: Job              | Promise<void> | Initializes the memory with job data and sets the current stage to "create-sub-problems". |
| setStage              | stage: PsMemoryStageTypes | Promise<void> | Sets the current stage in the memory and updates the start time for the stage. |
| processSubProblems    | None                  | Promise<void> | Processes the sub-problems by creating them. |
| process               | None                  | Promise<void> | Main processing function that handles the logic for transitioning between different stages based on the current stage in memory. |

## Example

```typescript
import { Worker, Job } from "bullmq";
import { AgentProblems } from '@policysynth/agents/problems/problems.js';

const agent = new Worker(
  "agent-problems",
  async (job: Job) => {
    console.log(`Agent Problems Processing job ${job.id}`);
    const agent = new AgentProblems();
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