# SearchWebProcessor

This class extends `BaseProblemSolvingAgent` to perform web searches using either Google or Bing search APIs based on environment configurations. It processes search queries related to problem statements, sub-problems, and entities, deduplicates the results, and updates the memory with the search results.

## Properties

| Name     | Type                     | Description                                   |
|----------|--------------------------|-----------------------------------------------|
| seenUrls | Map<string, Set<string>> | Stores URLs that have been seen to avoid duplicates in search results. |

## Methods

| Name                    | Parameters                                  | Return Type                             | Description                                                                 |
|-------------------------|---------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------|
| callSearchApi           | query: string                               | Promise<IEngineSearchResultItem[]>      | Calls the appropriate search API (Google or Bing) based on environment settings and returns search results. |
| getQueryResults         | queriesToSearch: string[], id: string       | Promise<{ searchResults: IEngineSearchResultItem[] }> | Processes a list of queries, fetches and deduplicates the search results. |
| processSubProblems      | searchQueryType: IEngineWebPageTypes        | Promise<void>                           | Processes search queries for all sub-problems based on the type of search query. |
| processEntities         | subProblemIndex: number, searchQueryType: IEngineWebPageTypes | Promise<void>                           | Processes search queries for entities within a specific sub-problem. |
| processProblemStatement | searchQueryType: IEngineWebPageTypes        | Promise<void>                           | Processes search queries for the problem statement. |
| process                 |                                             | Promise<void>                           | Orchestrates the processing of problem statements, sub-problems, and entities. Calls search APIs and updates memory with results. |

## Example

```typescript
import { SearchWebProcessor } from '@policysynth/agents/solutions/web/searchWeb.js';

const searchProcessor = new SearchWebProcessor();

// Example usage to process web searches
searchProcessor.process().then(() => {
  console.log("Processing complete.");
}).catch(error => {
  console.error("Error during processing:", error);
});
```