# runPolicyStage

This script is responsible for updating the memory state of a project in Redis and adding a job to a BullMQ queue for further processing based on the project ID provided as a command-line argument.

## Properties

No properties are directly defined in this script.

## Methods

No methods are directly defined in this script.

## Example

```javascript
// Example usage of runPolicyStage
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const myQueue = new Queue("agent-policies");

const projectId = process.argv[2];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

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