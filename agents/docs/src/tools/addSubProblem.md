# addSubProblem

This script is used to add a sub-problem to a project's innovation memory data in Redis. It takes a project ID as an argument, retrieves the corresponding project from Redis, adds a predefined sub-problem to the project's list of sub-problems, and then updates the project in Redis.

## Properties

No properties are directly defined in this script.

## Methods

No methods are directly defined in this script.

## Example

```
// Example usage of addSubProblem
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const projectId = process.argv[2];

const subProblem = {
  title: "Legal System Misuse for Political Advantage",
  description: "Authoritarians are increasingly exploiting the legal system to suppress opposition and manipulate election outcomes. This involves a range of tactics, from altering election administration and policies to weaponizing the judiciary against dissent.",
  whyIsSubProblemImportant: "The manipulation of the legal system undermines the principles of democracy, specifically the rule of law and fair elections. Understanding and addressing this misuse is crucial to preserve democratic processes, re-establish faith in the legal system, and ensure the proper administration of justice."
} as IEngineSubProblem;

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
  console.log("Usage: node addSubProblem <projectId>");
  process.exit(1);
}
```

This example demonstrates how to use the script to add a sub-problem to a project's innovation memory data stored in Redis. It requires the `projectId` as a command-line argument.