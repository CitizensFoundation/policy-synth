# addSubProblem

This script is used to add a sub-problem to a project's problem statement in a Redis database. It requires a project ID as a command-line argument.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| redis         | ioredis | Redis client instance.    |
| projectId     | string | ID of the project.        |
| subProblem    | PsSubProblem | Object representing a sub-problem to be added. |
| redisKey      | string | Redis key under which project data is stored. |
| projectTxt    | string | JSON string retrieved from Redis. |
| project       | PsBaseMemoryData | Project data parsed from `projectTxt`. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| None       | None              | None        | This script does not define methods but executes a sequence of operations based on the presence of `projectId`. |

## Example

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";

// Example usage of addSubProblem
import '@policysynth/agents/tools/addSubProblem.js';

const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const projectId = process.argv[2];

const subProblem = {
  title: "Legal System Misuse for Political Advantage",
  description: "Authoritarians are increasingly exploiting the legal system to suppress opposition and manipulate election outcomes. This involves a range of tactics, from altering election administration and policies to weaponizing the judiciary against dissent.",
  whyIsSubProblemImportant: "The manipulation of the legal system undermines the principles of democracy, specifically the rule of law and fair elections. Understanding and addressing this misuse is crucial to preserve democratic processes, re-establish faith in the legal system, and ensure the proper administration of justice."
} as PsSubProblem;

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;

  const projectTxt = await redis.get(`st_mem:${projectId}:id`);
  const project = JSON.parse(
    projectTxt!
  ) as PsBaseMemoryData;

  project.subProblems.push(subProblem);

  await redis.set(redisKey, JSON.stringify(project));
  process.exit(0);
} else {
  console.log("Usage: node addProblemStatement <projectId>");
  process.exit(1);
}
```