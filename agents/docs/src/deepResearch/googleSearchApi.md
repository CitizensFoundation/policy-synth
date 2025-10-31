# GoogleSearchApi

A simple agent class for performing Google Custom Search API queries with automatic retry and backoff on rate limits. Inherits from `PolicySynthSimpleAgentBase`. Designed for use within the PolicySynth agent framework.

## Properties

| Name           | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| needsAiModel   | boolean | Indicates if an AI model is required (always `false` for this agent). |

## Methods

| Name                    | Parameters                                                                                      | Return Type                | Description                                                                                                 |
|-------------------------|-------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| googleRequestWithRetry   | fn: () => Promise<T>                                                                           | Promise<T>                 | Executes a function with retry logic and exponential backoff for HTTP 429 errors (rate limits).             |
| search                  | query: string, numberOfResults: number, options?: PsSearchOptions                               | Promise<PsSearchResultItem[]> | Performs a Google Custom Search API query, returning up to `numberOfResults` results, with optional filters.|

---

### Method Details

#### googleRequestWithRetry

Executes a provided async function, retrying up to 30 times with exponential backoff (up to 60 seconds) if a 429 (rate limit) error is encountered. Throws on other errors or if the retry limit is exceeded.

**Parameters:**
- `fn`: A function returning a Promise (typically an axios request).

**Returns:**  
- The resolved value of the function, or throws an error if retries are exhausted.

#### search

Performs a Google Custom Search API query, handling pagination and optional date filters. Uses `googleRequestWithRetry` to handle rate limits.

**Parameters:**
- `query`: The search query string.
- `numberOfResults`: The total number of results to fetch.
- `options` (optional): An object of type `PsSearchOptions` to specify date filters and sorting.

**Returns:**  
- A Promise resolving to an array of `PsSearchResultItem` objects.

---

## Example

```typescript
import { GoogleSearchApi } from '@policysynth/agents/deepResearch/googleSearchApi.js';

const googleSearchAgent = new GoogleSearchApi();

(async () => {
  const results = await googleSearchAgent.search(
    "climate change policy",
    5,
    { dateRestrict: "d7" } // last 7 days
  );
  console.log(results);
})();
```

---

## Types Used

### PsSearchOptions

```typescript
interface PsSearchOptions {
  before?: string;
  after?: string;
  dateRestrict?: string; // e.g., "d7" for last 7 days
  sort?: string;         // e.g., "date:r:20240101:20240601"
}
```

### PsSearchResultItem

```typescript
interface PsSearchResultItem {
  title: string;
  originalPosition: number;
  description: string;
  url: string;
  date: string;
  eloRating?: number;
}
```

---

## Notes

- Requires `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_API_CX_ID` to be set in environment variables.
- Handles Google Custom Search API pagination and rate limits automatically.
- Logs debug information for each result and errors encountered.
- Does **not** require an AI model (`needsAiModel = false`).
