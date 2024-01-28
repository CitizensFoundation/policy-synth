# runSolutionStage

This script is responsible for managing the solution stage of a project. It retrieves the current memory state of a project from Redis, updates the current stage of the project's memory, and then saves the updated memory back to Redis. Additionally, it adds a job to a BullMQ queue for further processing.

## Properties

No properties are documented as this script does not define a class or object structure with properties.

## Methods

No methods are documented as this script does not define a class or object structure with methods.

## Example

```typescript
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

  const memory = JSON.parse(output!) as PsBaseMemoryData;
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