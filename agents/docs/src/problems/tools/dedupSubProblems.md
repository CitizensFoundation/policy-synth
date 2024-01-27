# dedupSubProblems

This script is designed to deduplicate sub-problems within a project's memory data in Redis. It connects to a Redis instance, retrieves a project's memory data by its ID, removes any duplicate sub-problems based on their descriptions, and updates the project's memory data in Redis.

## Methods

| Name   | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| main   | None       | void        | The main function of the script. It retrieves a project's memory data from Redis, deduplicates the sub-problems, and updates the memory data back in Redis. |

## Example

```javascript
// Example usage of dedupSubProblems
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const main = async () => {
  const projectId = process.argv[2];

  if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const currentProject =  JSON.parse(await redis.get(redisKey) || "") as PsBaseMemoryData;

    const foundDescriptions = new Set<string>();
    const newSubProblems: IEngineSubProblem[] = [];
    let duplicateCount = 0;
    currentProject.subProblems.forEach((subProblem) => {
      if (!foundDescriptions.has(subProblem.description)) {
        newSubProblems.push(subProblem);
        foundDescriptions.add(subProblem.description);
      } else {
        duplicateCount++;
      }
    });

    currentProject.subProblems = newSubProblems;
    await redis.set(redisKey, JSON.stringify(currentProject));

    console.log(`Sub problems deduped successfully with ${duplicateCount} duplicates removed`);
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

Note: This example assumes the existence of `PsBaseMemoryData` and `IEngineSubProblem` types, which are not defined in the provided script. These types should be defined elsewhere in your project to use this script as intended.