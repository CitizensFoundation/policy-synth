# SearchWebProcessor

The `SearchWebProcessor` class extends the `BaseProcessor` to perform web searches using either Google or Bing search APIs and process the results.

## Properties

| Name       | Type                        | Description                                   |
|------------|-----------------------------|-----------------------------------------------|
| seenUrls   | Map<string, Set<string>>    | Stores URLs that have been seen to avoid duplicates. |

## Methods

| Name                    | Parameters                            | Return Type                             | Description                                                                 |
|-------------------------|---------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------|
| callSearchApi           | query: string                         | Promise<IEngineSearchResultItem[]>      | Calls the appropriate search API based on environment variables and returns search results. |
| getQueryResults         | queriesToSearch: string[], id: string | Promise<{ searchResults: IEngineSearchResultItem[] }> | Retrieves search results for the given queries and deduplicates them based on seen URLs. |
| processSubProblems      | searchQueryType: IEngineWebPageTypes  | Promise<void>                           | Processes sub-problems by searching and storing results for each sub-problem. |
| processEntities         | subProblemIndex: number, searchQueryType: IEngineWebPageTypes | Promise<void> | Processes entities within sub-problems by searching and storing results. |
| processProblemStatement | searchQueryType: IEngineWebPageTypes  | Promise<void>                           | Processes the problem statement by searching and storing results. |
| process                 |                                       | Promise<void>                           | Orchestrates the search process for problem statements, sub-problems, and entities. |

## Examples

```typescript
// Example usage of the SearchWebProcessor class
const searchWebProcessor = new SearchWebProcessor();

// Example of calling process to start the web search process
searchWebProcessor.process().then(() => {
  console.log('Finished processing web search');
}).catch(error => {
  console.error('Error processing web search', error);
});
```