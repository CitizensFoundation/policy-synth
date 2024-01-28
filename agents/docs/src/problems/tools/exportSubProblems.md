# exportSubProblems

This script exports sub-problems of a project from Redis to a CSV file. It requires a project ID and an output file path as command-line arguments.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| main       | None              | void        | Main function that exports sub-problems to a CSV file. |

## Example

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";
import fs from "fs/promises";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const main = async () => {
  const projectId = process.argv[2];
  const outFilePath = process.argv[3];

  if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const currentProject =  JSON.parse(await redis.get(redisKey) || "") as PsBaseMemoryData;

    let outCsvFile = `Description,Title,"Why important","Elo Rating","Search type"`;
    currentProject.subProblems.forEach((subProblem) => {
      outCsvFile += `\n"${subProblem.description}","${subProblem.title}","${subProblem.whyIsSubProblemImportant}","${subProblem.eloRating}","${subProblem.fromSearchType}"`;
    });

    await fs.writeFile(outFilePath, outCsvFile);

    console.log("Sub problems exported successfully");
    process.exit(0);
  } else {
    console.error("Project id is required");
    process.exit(1);
  }
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

This example demonstrates how to use the `exportSubProblems` script to export sub-problems from Redis to a CSV file. It utilizes the `ioredis` package for Redis operations and the `fs/promises` module for file system operations.