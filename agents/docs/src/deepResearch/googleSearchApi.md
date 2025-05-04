# GoogleSearchApi

A simple agent class for performing Google Custom Search queries with automatic retry and exponential backoff on rate limits (HTTP 429). This agent is designed to be used within the PolicySynth agent framework and does **not** require an AI model.

**File:** `@policysynth/agents/deepResearch/googleSearchApi.js`

## Properties

| Name           | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| needsAiModel   | boolean | Indicates if an AI model is required (always `false` for this agent). |

## Methods

| Name    | Parameters                                                                 | Return Type                | Description                                                                                      |
|---------|----------------------------------------------------------------------------|----------------------------|--------------------------------------------------------------------------------------------------|
| search  | `query: string, numberOfResults: number`                                   | `Promise<PsSearchResultItem[]>` | Performs a Google Custom Search for the given query, returning up to the specified number of results. Handles pagination and rate limiting. |

## Helper Functions (Internal)

- **sleep(ms: number): Promise<void>**  
  Pauses execution for the specified number of milliseconds.

- **googleRequestWithRetry<T>(fn: () => Promise<T>): Promise<T>**  
  Wraps a promise-returning function with retry logic for HTTP 429 errors, using exponential backoff.

## Usage Example

```typescript
import { GoogleSearchApi } from '@policysynth/agents/deepResearch/googleSearchApi.js';

async function example() {
  const googleSearch = new GoogleSearchApi();

  // Search for the top 15 results for "climate change policy"
  const results = await googleSearch.search("climate change policy", 15);

  results.forEach((result, idx) => {
    console.log(`${idx + 1}. ${result.title} (${result.date})`);
    console.log(result.url);
    console.log(result.description);
    console.log('---');
  });
}

example();
```

## Details

### search(query: string, numberOfResults: number): Promise<PsSearchResultItem[]>

Performs a Google Custom Search using the provided query string and returns up to `numberOfResults` results. Handles pagination (Google API returns up to 10 results per request) and rate limiting (HTTP 429) with exponential backoff.

- **query**: The search query string.
- **numberOfResults**: The maximum number of results to return.

**Returns:**  
A promise that resolves to an array of `PsSearchResultItem` objects, each containing:

| Field             | Type    | Description                                 |
|-------------------|---------|---------------------------------------------|
| originalPosition  | number  | The 1-based index of the result in the output list. |
| title             | string  | The title of the search result.             |
| url               | string  | The URL of the search result.               |
| description       | string  | The snippet/description of the result.      |
| date              | string  | ISO date string if available, otherwise empty. |

### Rate Limiting and Retry

If the Google API returns a 429 (Too Many Requests) error, the agent will automatically back off and retry, doubling the wait time up to a maximum of 60 seconds, for up to 30 attempts.

### Environment Variables

- `GOOGLE_SEARCH_API_KEY`: Your Google Custom Search API key.
- `GOOGLE_SEARCH_API_CX_ID`: Your Google Custom Search Engine ID.

These must be set in your environment for the agent to function.

---

**Note:**  
This agent is intended for use within the PolicySynth agent ecosystem and extends `PolicySynthSimpleAgentBase`. It can be used as a building block for more complex research or data-gathering agents.