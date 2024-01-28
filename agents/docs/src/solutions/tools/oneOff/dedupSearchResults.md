# DeduplicateSearchProcessor

This class is responsible for deduplicating search results based on a specified property. It operates on a memory object that contains problem statements, sub-problems, and entities, each with their own search results. The deduplication process can significantly reduce the number of search results by removing duplicates, thereby making the data more manageable and relevant.

## Properties

| Name               | Type                             | Description                                                                 |
|--------------------|----------------------------------|-----------------------------------------------------------------------------|
| memory             | PsBaseMemoryData                 | The memory object containing search results to be deduplicated.             |
| deduplicatedCount  | number                           | The count of search results after deduplication.                            |
| totalCount         | number                           | The total count of search results before deduplication.                     |
| seenUrls           | Map<string, Set<string>>         | A map to track seen URLs for deduplication purposes.                        |

## Methods

| Name                          | Parameters                                             | Return Type                      | Description                                                                                   |
|-------------------------------|--------------------------------------------------------|----------------------------------|-----------------------------------------------------------------------------------------------|
| deduplicateArrayByProperty    | arr: Array<IEngineSearchResultItem>, prop: string, id: string | Array<IEngineSearchResultItem> | Deduplicates an array of search result items by a specified property.                        |
| deduplicateSubProblems        | searchQueryType: IEngineWebPageTypes                   | void                             | Deduplicates search results for all sub-problems.                                             |
| deduplicateEntities           | subProblemIndex: number, searchQueryType: IEngineWebPageTypes | void                             | Deduplicates search results for entities within a specific sub-problem.                      |
| deduplicateProblemStatement   | searchQueryType: IEngineWebPageTypes                   | void                             | Deduplicates search results for the problem statement.                                        |
| process                       | None                                                   | void                             | Initiates the deduplication process for problem statements, sub-problems, and entities.       |

## Example

```typescript
import { DeduplicateSearchProcessor } from '@policysynth/agents/solutions/tools/oneOff/dedupSearchResults.js';
import ioredis from "ioredis";

const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const projectId = process.argv[2];

const dedup = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsBaseMemoryData;

    const dedupper = new DeduplicateSearchProcessor(memory);
    dedupper.process();

    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
    process.exit(0);
  } else {
    console.log("No project id provided - deduplicate search results");
    process.exit(1);
  }
};

dedup().catch((error) => {
  console.error(error);
  process.exit(1);
});
```