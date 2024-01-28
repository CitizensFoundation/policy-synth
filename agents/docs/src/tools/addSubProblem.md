# addSubProblem

This script is used to add a sub-problem to a project's memory data in Redis. It takes a project ID as an argument, retrieves the project's current memory data, adds a new sub-problem to it, and then updates the project's memory data in Redis.

## Properties

No properties are directly defined in this script.

## Methods

No methods are directly defined in this script.

## Example

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";

// Initialize Redis connection
const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

// The project ID is passed as a command-line argument
const projectId = process.argv[2];

// Define the sub-problem to be added
const subProblem = {
  title: "Legal System Misuse for Political Advantage",
  description: "Authoritarians are increasingly exploiting the legal system to suppress opposition and manipulate election outcomes. This involves a range of tactics, from altering election administration and policies to weaponizing the judiciary against dissent.",
  whyIsSubProblemImportant: "The manipulation of the legal system undermines the principles of democracy, specifically the rule of law and fair elections. Understanding and addressing this misuse is crucial to preserve democratic processes, re-establish faith in the legal system, and ensure the proper administration of justice."
} as IEngineSubProblem;

if (projectId) {
  // Construct the Redis key for the project's memory data
  const redisKey = `st_mem:${projectId}:id`;

  // Retrieve the project's current memory data from Redis
  const projectTxt = await redis.get(`st_mem:${projectId}:id`);
  const project = JSON.parse(
    projectTxt!
  ) as PsBaseMemoryData;

  // Add the new sub-problem to the project's memory data
  project.subProblems.push(subProblem);

  // Update the project's memory data in Redis
  await redis.set(redisKey, JSON.stringify(project));
  process.exit(0);
} else {
  console.log("Usage: node addSubProblem <projectId>");
  process.exit(1);
}
```

This example demonstrates how to use the script to add a sub-problem to a project's memory data stored in Redis. It requires the `ioredis` package for Redis operations and expects a project ID as a command-line argument.