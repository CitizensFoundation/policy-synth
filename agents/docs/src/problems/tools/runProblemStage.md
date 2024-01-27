# runProblemStage

This script is designed to update the current stage of a problem-solving process in a Redis database and then add a job to a BullMQ queue for further processing. It requires a project ID as an argument to run.

## Properties

This script does not define a class with properties.

## Methods

This script does not define a class with methods.

## Example

```javascript
// Example usage of runProblemStage
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-problems");

const projectId = process.argv[2];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as PsBaseMemoryData;

  memory.currentStage = "create-problem-statement-image";

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("Adding job to queue");
  await myQueue.add(
    "agent-problems",
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
  console.log("Usage: node @policysynth/agents/problems/tools/runProblemStage.js <projectId>");
  process.exit(0);
}
```