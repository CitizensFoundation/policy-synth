# AgentPolicies

AgentPolicies extends BaseAgentProcessor to handle various stages of policy processing, including seeding policies, creating images, searching for evidence, and ranking evidence.

## Properties

| Name    | Type                                  | Description |
|---------|---------------------------------------|-------------|
| memory  | IEngineInnovationMemoryData           | Holds the state and data relevant to the current job being processed. |

## Methods

| Name               | Parameters                  | Return Type | Description |
|--------------------|-----------------------------|-------------|-------------|
| initializeMemory   | job: Job                    | Promise<void> | Initializes the memory with job data and sets the initial stage to "policies-seed". |
| setStage           | stage: IEngineStageTypes    | Promise<void> | Sets the current stage in the memory and updates the start time for the stage. |
| process            |                             | Promise<void> | Processes the job based on the current stage in the memory. It may involve creating seed policies, creating policy images, creating evidence search queries, searching the web for evidence, getting evidence web pages, ranking web evidence, rating web evidence, getting refined evidence, or getting metadata for top evidence. |

## Example

```typescript
import { Job } from "bullmq";
import { AgentPolicies } from '@policysynth/agents/policies/policies.ts';

async function processJob(job: Job) {
  console.log(`Processing job ${job.id}`);
  const agentPolicies = new AgentPolicies();
  await agentPolicies.setup(job);
  await agentPolicies.process();
  return job.data;
}

const job = new Job(); // Assuming job is already defined and populated
processJob(job).then((data) => {
  console.log("Job processed with data:", data);
}).catch((error) => {
  console.error("Error processing job:", error);
});
```