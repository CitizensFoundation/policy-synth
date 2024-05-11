# createNewCustomProject

This script is used to create a new custom project in the system. It checks if a project with the given ID already exists and, based on the presence of a 'force' parameter, either overwrites the existing project or aborts the operation.

## Properties

No properties are directly exposed by this script as it primarily functions through the execution of its internal logic.

## Methods

No methods are defined in this script as it is a standalone executable script designed for direct execution.

## Example

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";

const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const projectId = process.argv[2];
const force = process.argv[3];

if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const problemStatement = ``;

  const currentProject = await redis.get(`st_mem:${projectId}:id`);

  if (currentProject && !force) {
    console.error("Project already exists, use force as second parameter to overwrite");
    process.exit(1);
  } else if (!currentProject || (currentProject && force)) {
    const project = {
      redisKey: redisKey,
      groupId: parseInt(projectId),
      communityId: 2,
      domainId: 1,
      stage: "create-sub-problems",
      currentStage: "create-sub-problems",
      stages: PolicySynthAgentBase.emptyDefaultStages,
      timeStart: Date.now(),
      totalCost: 0,
      customInstructions: {},
      problemStatement: {
        description: problemStatement,
        searchQueries: {
          general: [],
          scientific: [],
          news: [],
          openData: [],
        },
        searchResults: {
          pages: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          }
        },
      },
      subProblems: [],
      currentStageData: undefined,
    } as PsBaseMemoryData;

    await redis.set(redisKey, JSON.stringify(project));
  }

  console.log("Project created");
  process.exit(0);
} else {
  console.log("Usage: node createNewCustomProject <projectId>");
  process.exit(1);
}
```

This example demonstrates how to use the script to create a new custom project. It requires the `projectId` as a command-line argument and optionally accepts a `force` argument to overwrite an existing project.