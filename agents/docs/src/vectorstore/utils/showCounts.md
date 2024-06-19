# ShowCounts

ShowCounts extends BaseProblemSolvingAgent to count web pages and solutions from a vector store.

## Properties

| Name                   | Type                  | Description                                       |
|------------------------|-----------------------|---------------------------------------------------|
| webPageVectorStore     | WebPageVectorStore    | Instance of WebPageVectorStore.                   |
| foundIds               | Set<string>           | Set to track unique web page IDs.                 |
| foundUrls              | Set<string>           | Set to track unique web page URLs.                |
| totalWebPageCount      | number                | Total count of web pages processed.               |
| totalSolutionsFound    | number                | Total count of solutions found.                   |
| totalEmptySolutions    | number                | Count of web pages with no solutions identified.  |
| totalNonEmptySolutions | number                | Count of web pages with solutions identified.     |

## Methods

| Name            | Parameters                        | Return Type                  | Description                                           |
|-----------------|-----------------------------------|------------------------------|-------------------------------------------------------|
| countWebPages   | subProblemIndex: number \| undefined | Promise<{ webPageCount: number; solutionsCount: number; }> | Counts web pages and solutions for a given sub problem index. |
| process         | -                                 | Promise<void>                | Processes the counting of web pages and solutions.    |

## Example

```typescript
import { ShowCounts } from '@policysynth/agents/vectorstore/utils/showCounts.js';
import ioredis from "ioredis";

async function run() {
  const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
  const projectId = process.argv[2];

  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;

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