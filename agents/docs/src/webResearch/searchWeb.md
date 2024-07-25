# BaseSearchWebAgent

The `BaseSearchWebAgent` class is designed to perform web searches using either the Google Search API or the Bing Search API, depending on the available environment variables. It extends the `PolicySynthAgentBase` class and provides methods to call the search APIs and process the search results.

## Properties

| Name      | Type                        | Description                                      |
|-----------|-----------------------------|--------------------------------------------------|
| seenUrls  | Map<string, Set<string>>    | A map to keep track of URLs that have been seen. |

## Methods

| Name            | Parameters                          | Return Type                | Description                                                                 |
|-----------------|-------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| callSearchApi   | query: string                       | Promise<PsSearchResultItem[]> | Calls the appropriate search API based on the available environment variables. |
| getQueryResults | queriesToSearch: string[], id: string | Promise<{ searchResults: PsSearchResultItem[] }> | Retrieves and processes search results for the given queries.               |

## Example

```typescript
import { BaseSearchWebAgent } from '@policysynth/agents/webResearch/searchWeb.js';

const searchAgent = new BaseSearchWebAgent();

const queries = ["example query 1", "example query 2"];
const id = "unique-id";

searchAgent.getQueryResults(queries, id).then(results => {
  console.log(results);
}).catch(error => {
  console.error(error);
});
```

## Detailed Method Descriptions

### callSearchApi

```typescript
async callSearchApi(query: string): Promise<PsSearchResultItem[]>
```

Calls the appropriate search API based on the available environment variables.

- **Parameters:**
  - `query` (string): The search query string.

- **Returns:**
  - `Promise<PsSearchResultItem[]>`: A promise that resolves to an array of search result items.

- **Throws:**
  - `Error`: If no search API key is available.

### getQueryResults

```typescript
async getQueryResults(queriesToSearch: string[], id: string): Promise<{ searchResults: PsSearchResultItem[] }>
```

Retrieves and processes search results for the given queries.

- **Parameters:**
  - `queriesToSearch` (string[]): An array of search query strings.
  - `id` (string): A unique identifier to track seen URLs.

- **Returns:**
  - `Promise<{ searchResults: PsSearchResultItem[] }>`: A promise that resolves to an object containing an array of search result items.

- **Description:**
  - Iterates over the provided queries and calls the `callSearchApi` method to get search results.
  - Logs the search data and results for debugging purposes.
  - Deduplicates the search results based on the URLs seen for the given `id`.
  - Returns the deduplicated search results.
```