# runEvolutionStep

This script is designed to run a series of stages for evolving solutions in a project. It utilizes a Redis queue to manage and execute tasks asynchronously.

## Properties

No properties are directly defined in this script.

## Methods

| Name               | Parameters                  | Return Type       | Description                                                                 |
|--------------------|-----------------------------|-------------------|-----------------------------------------------------------------------------|
| getInnovationData  |                             | Promise<any>      | Retrieves innovation data from Redis based on a project ID.                 |
| runStages          | startStage: PsMemoryStageTypes | Promise<void>    | Runs the specified stages for the project, starting from the given stage.   |

## Example

```typescript
import { Queue, QueueEvents } from "bullmq";
import ioredis from "ioredis";

// Initialization of Redis and Queue
const myQueue = new Queue("agent-solutions");
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const queueEvents = new QueueEvents("agent-solutions");

// Example usage of running evolution steps
const projectId = "exampleProjectId";
if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const getInnovationData = async () => {
    const output = await redis.get(redisKey);
    const memory = JSON.parse(output!) as PsBaseMemoryData;
    return memory;
  };

  const stages = [
    "evolve-create-population",
    "evolve-reap-population",
    "create-pros-cons",
    "rank-pros-cons",
    "rank-solutions",
    "create-solution-images",
    "group-solutions"
  ] as unknown as PsMemoryStageTypes;

  const runStages = async (startStage = stages[0]) => {
    // Implementation of running stages
  };

  const startStage = process.argv[3] || stages[0];
  runStages(startStage)
    .then(() => {
      console.log("All stages completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error(`Error running stages: ${error}`);
      process.exit(1);
    });
} else {
  console.log("Usage: npm runEvolutionStep <projectId>");
  process.exit(0);
}
```

Note: This example assumes the existence of `PsBaseMemoryData` and `PsMemoryStageTypes` types, which are not defined in the provided script.