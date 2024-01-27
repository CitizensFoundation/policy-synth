# runSolutionStage

This script is responsible for managing the execution of different stages in the solution process. It interacts with Redis to retrieve and update the current memory state of a project and queues a job for further processing.

## Properties

No properties are directly defined in this script.

## Methods

No methods are directly defined in this script.

## Example

```javascript
// Example usage of runSolutionStage
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-solutions");

const projectId = process.argv[2];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as IEngineInnovationMemoryData;
  memory.currentStage = "create-solution-images";

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("Adding job to queue");
  await myQueue.add(
    "agent-innovation",
    {
      groupId: projectId,
      communityId: 1,
      domainId: 1,
    },
    { removeOnComplete: true, removeOnFail: true }
  );

  console.log("After adding job to queue");
  process.exit(0);
} else {
  console.log("Usage: node @policysynth/agents/solutions/tools/runSolutionStage.js <projectId>");
  process.exit(0);
}
```