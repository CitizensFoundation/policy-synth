# SearchWebProcessor

This class extends `BaseProblemSolvingAgent` to perform web searches using either Google or Bing search APIs based on the environment configuration. It processes search queries for problem statements, sub-problems, and entities, deduplicates the results, and updates the memory with the search results.

## Properties

| Name     | Type                        | Description                                   |
|----------|-----------------------------|-----------------------------------------------|
| seenUrls | Map<string, Set<string>>    | Stores URLs that have been seen to avoid duplicates in search results. |

## Methods

| Name                   | Parameters                                      | Return Type                             | Description                                                                 |
|------------------------|-------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------|
| callSearchApi          | query: string                                   | Promise<IEngineSearchResultItem[]>     | Calls the appropriate search API (Google or Bing) based on environment variables and returns the search results. |
| getQueryResults        | queriesToSearch: string[], id: string           | Promise<{ searchResults: IEngineSearchResultItem[] }> | Fetches search results for given queries and deduplicates them based on URLs. |
| processSubProblems     | searchQueryType: IEngineWebPageTypes            | Promise<void>                           | Processes search queries for all sub-problems based on the given search query type. |
| processEntities        | subProblemIndex: number, searchQueryType: IEngineWebPageTypes | Promise<void>                           | Processes search queries for entities within a sub-problem based on the given search query type. |
| processProblemStatement| searchQueryType: IEngineWebPageTypes            | Promise<void>                           | Processes search queries for the problem statement based on the given search query type. |
| process                |                                                 | Promise<void>                           | Orchestrates the processing of problem statement, sub-problems, and entities search queries. |

## Example

```javascript
// Example usage of SearchWebProcessor
import { SearchWebProcessor } from '@policysynth/agents/solutions/web/searchWeb.js';

const searchWebProcessor = new SearchWebProcessor();

// Assuming environment variables for search API keys are set
searchWebProcessor.process()
  .then(() => console.log('Finished processing web search'))
  .catch(error => console.error('Error processing web search', error));
```