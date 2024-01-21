# ShowCounts

ShowCounts is a processor class that extends the BaseProcessor class. It is responsible for counting web pages and solutions found within those web pages. It utilizes a WebPageVectorStore to retrieve web pages and processes them to gather statistics such as the total count of web pages, solutions found, empty solutions, and non-empty solutions. It also keeps track of unique web page IDs and URLs.

## Properties

| Name                    | Type                      | Description                                       |
|-------------------------|---------------------------|---------------------------------------------------|
| webPageVectorStore      | WebPageVectorStore        | Instance of WebPageVectorStore to access web pages. |
| foundIds                | Set<string>               | Set to keep track of unique web page IDs.         |
| foundUrls               | Set<string>               | Set to keep track of unique web page URLs.        |
| totalWebPageCount       | number                    | Total count of web pages processed.               |
| totalSolutionsFound     | number                    | Total count of solutions found.                   |
| totalEmptySolutions     | number                    | Total count of web pages with no solutions found. |
| totalNonEmptySolutions  | number                    | Total count of web pages with solutions found.    |

## Methods

| Name             | Parameters                          | Return Type                  | Description                                                                 |
|------------------|-------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| countWebPages    | subProblemIndex: number \| undefined | Promise<{ webPageCount: number; solutionsCount: number; }> | Counts the number of web pages and solutions for a given sub-problem index. |
| process          | -                                   | Promise<void>                | Main method to process counting of web pages and solutions.                 |

## Examples

```typescript
// Example usage of the ShowCounts class
const projectId = "exampleProjectId";
const redisKey = `st_mem:${projectId}:id`;
const output = await redis.get(redisKey);
const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

const counts = new ShowCounts({} as any, memory);
await counts.process();
```

Please note that the example assumes that the `projectId` is provided and that the `redis` instance is properly configured to connect to the Redis server. The `memory` object is expected to be of type `IEngineInnovationMemoryData` and is retrieved from Redis using the key constructed with the `projectId`.