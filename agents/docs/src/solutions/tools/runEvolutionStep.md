# EvolutionStepRunner

This script manages the execution of various stages in the evolution process of agent solutions using a Redis-backed queue system.

## Properties

| Name          | Type                         | Description               |
|---------------|------------------------------|---------------------------|
| myQueue       | Queue                        | BullMQ Queue instance for managing jobs. |
| redis         | ioredis.Redis                | Redis client instance for data storage and retrieval. |
| queueEvents   | QueueEvents                  | BullMQ QueueEvents instance for monitoring job events. |
| projectId     | string \| undefined          | Project identifier passed as a command-line argument. |
| redisKey      | string                       | Redis key constructed for storing memory data related to the project. |
| stages        | PsScMemoryStageTypes           | Array of stages in the evolution process. |

## Methods

| Name            | Parameters                  | Return Type       | Description                 |
|-----------------|-----------------------------|-------------------|-----------------------------|
| getInnovationData | none                      | Promise<PsSmarterCrowdsourcingMemoryData> | Retrieves and parses the innovation data from Redis. |
| runStages       | startStage: PsScMemoryStageTypes | Promise<void>   | Executes the specified stages in order, handling job creation, execution, and monitoring. |

## Example

```typescript
// Example usage of EvolutionStepRunner
import { Queue, Job, QueueEvents } from "bullmq";
import ioredis from "ioredis";
import { runEvolutionStep } from '@policysynth/agents/solutions/tools/runEvolutionStep.js';

const projectId = "123";
const startStage = "evolve-create-population";

runEvolutionStep(projectId, startStage)
  .then(() => console.log("Evolution process completed successfully."))
  .catch(error => console.error("Failed to complete the evolution process:", error));
```