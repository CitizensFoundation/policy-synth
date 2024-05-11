# runPolicyStage

This script is used to manage the policy stages for a given project by interacting with a Redis database and a BullMQ queue. It retrieves and updates the policy stage from Redis and adds a job to the BullMQ queue based on the project ID provided via command line arguments.

## Properties

No properties are directly defined in this script.

## Methods

No methods are directly defined in this script.

## Example

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-policies");

const projectId = process.argv[2];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as PsBaseMemoryData;

  // Update the current stage as needed
  // memory.currentStage = "desired-stage";

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("Adding job to queue");
  await myQueue.add(
    "agent-policies",
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
  console.log("Usage: node @policysynth/agents/policies/tools/runPolicyStage.js <projectId>");
  process.exit(0);
}
```
