# BaseSearchWebAgent

The `BaseSearchWebAgent` class is designed to perform web searches using either Google or Bing search APIs. It extends the `PolicySynthAgentBase` class and provides methods to call search APIs and retrieve search results while avoiding duplicate URLs.

## Properties

| Name     | Type                          | Description                        |
|----------|-------------------------------|------------------------------------|
| seenUrls | Map<string, Set<string>>      | A map to track seen URLs for deduplication purposes. |

## Methods

| Name            | Parameters                                      | Return Type                  | Description                                                                 |
|-----------------|-------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| callSearchApi   | query: string, numberOfResults: number, options?: PsSearchOptions          | Promise<PsSearchResultItem[]>| Calls the appropriate search API (Google or Bing) based on available keys.  |
| getQueryResults | queriesToSearch: string[], id: string, numberOfResults: number = 10, options?: PsSearchOptions | Promise<{ searchResults: PsSearchResultItem[] }> | Retrieves search results for a list of queries, ensuring no duplicate URLs. |

## Example

```typescript
import { BaseSearchWebAgent } from '@policysynth/agents/webResearch/searchWeb.js';

const searchAgent = new BaseSearchWebAgent();
const queries = ["example query 1", "example query 2"];
const results = await searchAgent.getQueryResults(queries, "uniqueId");
console.log(results.searchResults);
```

### Method Details

#### `callSearchApi`

This method determines which search API to use based on the environment variables set for API keys. It supports both Google and Bing search APIs.

- **Parameters:**
  - `query`: The search query string.
  - `numberOfResults`: The number of search results to retrieve.
  - `options?`: Optional `PsSearchOptions` with `before` or `after` date filters.

- **Returns:** A promise that resolves to an array of `PsSearchResultItem` containing the search results.

- **Throws:** An error if no search API key is available.

#### `getQueryResults`

This method performs searches for a list of queries and returns the combined results, ensuring that duplicate URLs are filtered out.

- **Parameters:**
  - `queriesToSearch`: An array of search query strings.
  - `id`: A unique identifier used to track seen URLs.
  - `numberOfResults`: The number of search results to retrieve per query (default is 10).
  - `options?`: Optional `PsSearchOptions` forwarded to the search API.

- **Returns:** A promise that resolves to an object containing the `searchResults`, which is an array of `PsSearchResultItem`.

- **Behavior:** 
  - Calls `callSearchApi` for each query.
  - Deduplicates URLs using the `seenUrls` map.
  - Logs the number of results before and after deduplication.