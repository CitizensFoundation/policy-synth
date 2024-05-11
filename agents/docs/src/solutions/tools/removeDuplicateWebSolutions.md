# RemoveDuplicateWebSolutions

This class extends `BaseProblemSolvingAgent` to identify and remove duplicate web solutions based on URLs stored in a vector store. It processes web pages in batches and removes duplicates from the store.

## Properties

| Name             | Type                  | Description                                       |
|------------------|-----------------------|---------------------------------------------------|
| webPageVectorStore | WebPageVectorStore   | Store for managing web page vectors.              |
| allUrls          | Set<string>           | Set to track all unique URLs encountered.         |
| duplicateUrls    | string[]              | List to store URLs identified as duplicates.      |

## Methods

| Name             | Parameters                  | Return Type | Description                                       |
|------------------|-----------------------------|-------------|---------------------------------------------------|
| constructor      | memory: PsBaseMemoryData    | void        | Initializes the agent with memory data.           |
| removeDuplicates | subProblemIndex: number     | Promise<void> | Processes and removes duplicate web pages for a given sub-problem index. |
| process          | none                        | Promise<void> | Processes all sub-problems to remove duplicate web solutions. |

## Example

```typescript
// Example usage of RemoveDuplicateWebSolutions
import { RemoveDuplicateWebSolutions } from '@policysynth/agents/solutions/tools/removeDuplicateWebSolutions.js';
import ioredis from "ioredis";

const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

const main = async () => {
  const projectId = process.argv[2];

  if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const projectMemoryData = JSON.parse((await redis.get(redisKey)) || "{}");

    if (projectMemoryData.subProblems) {
      const removeDuplicatesAgent = new RemoveDuplicateWebSolutions(projectMemoryData);
      await removeDuplicatesAgent.process();
      console.log("Sub problems processed successfully.");
    } else {
      console.error("No subProblems found in the project memory.");
    }
  } else {
    console.error("Project ID is required as a command-line argument.");
  }

  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```