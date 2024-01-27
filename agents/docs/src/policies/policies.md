# AgentPolicies

AgentPolicies extends BaseAgentProcessor to handle various stages of policy processing, including seed creation, image generation, evidence search, and evidence ranking.

## Properties

| Name    | Type                                  | Description               |
|---------|---------------------------------------|---------------------------|
| memory  | PsBaseMemoryData           | Holds the state and data relevant to the current job being processed. |

## Methods

| Name                | Parameters                  | Return Type | Description                                                                 |
|---------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| initializeMemory    | job: Job                    | Promise<void> | Initializes the memory with job data and sets the initial processing stage. |
| setStage            | stage: PsMemoryStageTypes    | Promise<void> | Updates the current stage in memory and records the start time.             |
| process             | None                        | Promise<void> | Processes the job based on the current stage set in memory.                  |

## Example

```javascript
// Example usage of AgentPolicies
import { Worker, Job } from "bullmq";
import { AgentPolicies } from '@policysynth/agents/policies/policies.js';

const agent = new Worker(
  "agent-policies",
  async (job: Job) => {
    console.log(`Agent Policies Processing job ${job.id}`);
    const agent = new AgentPolicies();
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