# GoogleSearchApi

The `GoogleSearchApi` class is a specialized agent that extends the `PolicySynthSimpleAgentBase`. It is designed to perform web searches using the Google Custom Search API.

## Properties

| Name          | Type | Description                              |
|---------------|------|------------------------------------------|
| needsAiModel  | boolean | Indicates if an AI model is needed. Defaults to `false`. |

## Methods

| Name       | Parameters        | Return Type          | Description                 |
|------------|-------------------|----------------------|-----------------------------|
| search     | query: string, numberOfResults: number, options?: PsSearchOptions | Promise<PsSearchResultItem[]> | Performs a search using the Google Custom Search API and returns an array of search results. |

### Method: `search`

#### Parameters

- `query: string`: The search query string.
- `numberOfResults: number`: The number of search results to retrieve.
- `options?: PsSearchOptions`: Optional search modifiers. Use `dateRestrict` for relative windows (e.g. `d7`) or `sort` with `date:r:YYYYMMDD:YYYYMMDD` for absolute ranges. Legacy `before` and `after` parameters are still supported.

#### Returns

- `Promise<PsSearchResultItem[]>`: A promise that resolves to an array of search result items.

#### Description

The `search` method performs a web search using the Google Custom Search API. It calculates the number of API calls needed based on the requested number of results and the maximum number of results that can be fetched per request (10). It constructs the API request URL using the provided query and environment variables for the API key and CX ID. The method processes the response to extract relevant search result data, including the title, URL, description, and date, and returns an array of `PsSearchResultItem` objects.

## Example

```typescript
import { GoogleSearchApi } from '@policysynth/agents/webResearch/googleSearchApi.js';

async function exampleUsage() {
  const googleSearchApi = new GoogleSearchApi();
  try {
    const results = await googleSearchApi.search(
      "liberal democracies: issues and solutions",
      20,
      { dateRestrict: "d7" }
    );
    console.log("Search results:", results);
  } catch (error) {
    console.error("Error during search:", error);
  }
}

exampleUsage();
```

### Environment Variables

- `GOOGLE_SEARCH_API_KEY`: Your Google Custom Search API key.
- `GOOGLE_SEARCH_API_CX_ID`: Your Google Custom Search Engine ID.
- `TEST_GOOGLE_SEARCH`: Set to `true` to enable the test function.

### Test Function

A test function is provided to demonstrate the usage of the `GoogleSearchApi` class. It can be executed by setting the `TEST_GOOGLE_SEARCH` environment variable to `true` and running the script. The test function performs a search and logs the results to the console.