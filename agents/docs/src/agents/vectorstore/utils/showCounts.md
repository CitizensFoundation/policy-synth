# ShowCounts

ShowCounts is a processor class that extends the BaseProlemSolvingAgent class. It is designed to count various statistics related to web pages and solutions identified within those web pages. It interacts with a web page vector store to retrieve web page data and performs counts on the number of web pages, solutions found, empty solutions, and non-empty solutions. It also keeps track of unique web page IDs and URLs.

## Properties

| Name                    | Type                        | Description                                           |
|-------------------------|-----------------------------|-------------------------------------------------------|
| webPageVectorStore      | WebPageVectorStore          | An instance of WebPageVectorStore.                    |
| foundIds                | Set<string>                 | A set of unique web page IDs found.                   |
| foundUrls               | Set<string>                 | A set of unique web page URLs found.                  |
| totalWebPageCount       | number                      | The total count of web pages processed.               |
| totalSolutionsFound     | number                      | The total count of solutions found.                   |
| totalEmptySolutions     | number                      | The total count of web pages with empty solutions.    |
| totalNonEmptySolutions  | number                      | The total count of web pages with non-empty solutions.|

## Methods

| Name             | Parameters                            | Return Type                  | Description                                                                 |
|------------------|---------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| countWebPages    | subProblemIndex: number \| undefined  | Promise<{ webPageCount: number; solutionsCount: number; }> | Counts the number of web pages and solutions for a given sub-problem index. |
| process          |                                       | Promise<void>                | Processes the counting of web pages and solutions.                          |

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