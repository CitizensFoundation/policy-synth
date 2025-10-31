# BaseSearchWebAgent

A base class for web search agents that provides unified access to Google and Bing search APIs, result deduplication, and logging. Designed for use in the PolicySynth agent framework.

## Properties

| Name      | Type                                 | Description                                                                 |
|-----------|--------------------------------------|-----------------------------------------------------------------------------|
| seenUrls  | Map&lt;string, Set&lt;string&gt;&gt; | Tracks URLs already seen for a given search session (by `id`) to deduplicate results. |

## Methods

| Name            | Parameters                                                                                          | Return Type                       | Description                                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------------|------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| callSearchApi   | query: string, numberOfResults: number, options?: PsSearchOptions                                   | Promise&lt;PsSearchResultItem[]&gt; | Calls either Google or Bing search API based on available environment variables. Throws if no API key is available. |
| getQueryResults | queriesToSearch: string[], id: string, numberOfResults?: number, options?: PsSearchOptions          | Promise&lt;{ searchResults: PsSearchResultItem[] }&gt; | Runs multiple queries, aggregates and deduplicates results by URL, and returns the combined results.                |

## Example

```typescript
import { BaseSearchWebAgent } from '@policysynth/agents/deepResearch/searchWeb.js';

const agent = new BaseSearchWebAgent();

// Example: Search for multiple queries and get deduplicated results
(async () => {
  const queries = ["climate change policy", "global warming solutions"];
  const sessionId = "search-session-1";
  const { searchResults } = await agent.getQueryResults(queries, sessionId, 5);

  console.log("Deduplicated search results:", searchResults);
})();
```

## Method Details

### callSearchApi

Calls the appropriate search API (Google or Bing) based on available environment variables.

- **Parameters:**
  - `query` (string): The search query.
  - `numberOfResults` (number): Number of results to fetch.
  - `options` (PsSearchOptions, optional): Additional search options (date restrictions, sorting, etc.).
- **Returns:** `Promise<PsSearchResultItem[]>`
- **Throws:** Error if no search API key is available.

### getQueryResults

Performs multiple search queries, aggregates results, and deduplicates them by URL for a given session.

- **Parameters:**
  - `queriesToSearch` (string[]): Array of search queries.
  - `id` (string): Unique identifier for the search session (used for deduplication).
  - `numberOfResults` (number, optional, default=10): Number of results per query.
  - `options` (PsSearchOptions, optional): Additional search options.
- **Returns:** `Promise<{ searchResults: PsSearchResultItem[] }>`
- **Behavior:** 
  - Calls `callSearchApi` for each query.
  - Aggregates all results.
  - Deduplicates results by URL using the `seenUrls` map for the given session `id`.
  - Returns the deduplicated results.

---

**Note:**  
- Requires either Google Search API credentials (`GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_API_CX_ID`) or Bing Search API key (`AZURE_BING_SEARCH_KEY`) to be set in environment variables.
- Uses logging via `this.logger` for error and debug output.
- Designed to be extended or used as a utility within more complex PolicySynth agents.