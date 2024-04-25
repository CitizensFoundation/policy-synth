# ShowCounts

This class extends `BaseProblemSolvingAgent` to count web pages and solutions from a vector store.

## Properties

| Name                  | Type                  | Description                                      |
|-----------------------|-----------------------|--------------------------------------------------|
| webPageVectorStore    | WebPageVectorStore    | Instance of WebPageVectorStore.                  |
| foundIds              | Set<string>           | Set of found web page IDs.                       |
| foundUrls             | Set<string>           | Set of found web page URLs.                      |
| totalWebPageCount     | number                | Total count of web pages processed.              |
| totalSolutionsFound   | number                | Total count of solutions found.                  |
| totalEmptySolutions   | number                | Total count of web pages with no solutions.      |
| totalNonEmptySolutions| number                | Total count of web pages with solutions.         |

## Methods

| Name            | Parameters                          | Return Type                  | Description                                      |
|-----------------|-------------------------------------|------------------------------|--------------------------------------------------|
| countWebPages   | subProblemIndex: number \| undefined| Promise<{webPageCount: number, solutionsCount: number}> | Counts web pages and solutions for a given sub-problem index. |
| process         |                                     | Promise<void>                | Processes counts for web pages and solutions.    |

## Example

```typescript
import { PsBaseMemoryData } from "@policysynth/agents/baseAgent.js";
import ioredis from "ioredis";
import { ShowCounts } from "@policysynth/agents/vectorstore/utils/showCounts.js";

async function run() {
  const projectId = process.argv[2];
  const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
  
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsBaseMemoryData;

    const counts = new ShowCounts({} as any, memory);
    await counts.process();
    process.exit(0);
  } else {
    console.log("No project id provided - show counts");
    process.exit(1);
  }
}

run();
```