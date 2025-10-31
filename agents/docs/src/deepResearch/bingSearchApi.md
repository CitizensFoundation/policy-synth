# BingSearchApi

A simple agent class for performing web searches using the Bing Search API (Azure Cognitive Services).  
This class extends `PolicySynthSimpleAgentBase` and provides a method to perform web searches, returning results in a standardized format.

**File:** `@policysynth/agents/deepResearch/bingSearchApi.js`

---

## Properties

| Name              | Type      | Description                                                                                  |
|-------------------|-----------|----------------------------------------------------------------------------------------------|
| SUBSCRIPTION_KEY  | `string \| undefined` | The Bing Search API subscription key, loaded from the `AZURE_BING_SEARCH_KEY` environment variable. |

---

## Methods

| Name    | Parameters                                                                                                                                         | Return Type                | Description                                                                                                   |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------|
| search  | `query: string, numberOfResults: number, options: PsSearchOptions = {}`                                                                            | `Promise<PsSearchResultItem[]>` | Performs a Bing web search for the given query and returns an array of search result items.                   |

---

### Method Details

#### constructor()

Initializes the BingSearchApi instance.  
Loads the Bing API subscription key from the environment variable `AZURE_BING_SEARCH_KEY`.  
Throws an error if the key is missing.

#### search(query, numberOfResults, options)

Performs a Bing web search for the given query.

- **Parameters:**
  - `query` (`string`): The search query string.
  - `numberOfResults` (`number`): The maximum number of results to return (max 50 per Bing API call).
  - `options` (`PsSearchOptions`, optional): Additional search options:
    - `before` (`string`): Restrict results to before this date.
    - `after` (`string`): Restrict results to after this date.
    - `dateRestrict` (`string`): Relative date restriction (e.g., `d7` for last 7 days).
    - `sort` (`string`): Absolute date range or sort parameter.

- **Returns:**  
  `Promise<PsSearchResultItem[]>` — An array of search result items, each with:
  - `title` (`string`): The title of the result.
  - `originalPosition` (`number`): The position in the result set.
  - `description` (`string`): The snippet/summary of the result.
  - `url` (`string`): The URL of the result.
  - `date` (`string`): The date the result was last crawled.
  - `eloRating?` (`number`): (Optional) Elo rating for ranking, if used.

- **Behavior:**
  - Appends date restrictions to the query if provided.
  - Handles Bing API's maximum result count per call (50).
  - Retries the request up to `PS_SEARCH_MAX_RETRIES` times (default 3) on failure, with exponential backoff.
  - Logs Bing API response headers and JSON for debugging.
  - Throws an error if all retries fail.

---

## Example

```typescript
import { BingSearchApi } from '@policysynth/agents/deepResearch/bingSearchApi.js';

async function example() {
  const bingAgent = new BingSearchApi();

  // Simple search
  const results = await bingAgent.search("climate change policy", 10);

  // Search with date restriction
  const resultsWithOptions = await bingAgent.search(
    "artificial intelligence ethics",
    5,
    {
      before: "2024-06-01",
      after: "2024-01-01",
      dateRestrict: "d30", // last 30 days
      sort: "date:r:20240101:20240601"
    }
  );

  console.log(resultsWithOptions);
}

example();
```

---

## Notes

- Requires the environment variable `AZURE_BING_SEARCH_KEY` to be set with a valid Bing Search API key.
- Optionally, set `PS_SEARCH_MAX_RETRIES` to control the number of retries on failure.
- The class is designed for use as a component in PolicySynth agent workflows, but can be used standalone for Bing search integration.
