# ShowCounts

This class extends `BaseProblemSolvingAgent` to count web pages and solutions found within them. It utilizes a `WebPageVectorStore` to retrieve web pages for processing and aggregates counts of various metrics such as total web pages, solutions found, and unique identifiers and URLs.

## Properties

| Name                | Type                  | Description                                      |
|---------------------|-----------------------|--------------------------------------------------|
| webPageVectorStore  | WebPageVectorStore    | Instance of WebPageVectorStore for data access.  |
| foundIds            | Set<string>           | Set of unique web page IDs found.                |
| foundUrls           | Set<string>           | Set of unique web page URLs found.               |
| totalWebPageCount   | number                | Total count of web pages processed.              |
| totalSolutionsFound | number                | Total count of solutions found.                  |
| totalEmptySolutions | number                | Count of web pages with no solutions found.      |
| totalNonEmptySolutions | number              | Count of web pages with solutions found.         |

## Methods

| Name            | Parameters                          | Return Type                             | Description                                           |
|-----------------|-------------------------------------|-----------------------------------------|-------------------------------------------------------|
| countWebPages   | subProblemIndex: number \| undefined | Promise<{ webPageCount: number; solutionsCount: number; }> | Counts web pages and solutions for a given sub-problem index. |
| process         |                                     | Promise<void>                          | Processes counts for web pages and solutions, logging the results. |

## Example

```javascript
import ioredis from "ioredis";
import { ShowCounts } from '@policysynth/agents/vectorstore/utils/showCounts.js';

const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

async function run() {
  const projectId = process.argv[2];

  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!); // Assuming PsBaseMemoryData type

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

This example demonstrates how to instantiate and use the `ShowCounts` class to process and count web pages and solutions based on a project ID.