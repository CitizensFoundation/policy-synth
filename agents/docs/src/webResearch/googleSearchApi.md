# GoogleSearchApi

The `GoogleSearchApi` class provides a simple interface to perform Google Search queries using the Google Custom Search API. It extends the `PolicySynthSimpleAgentBase` class.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| needsAiModel  | boolean | Indicates if an AI model is needed. Defaults to `false`. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| search     | query: string     | Promise<PsSearchResultItem[]> | Performs a search query using the Google Custom Search API and returns the results. |

## Example

```typescript
import { GoogleSearchApi } from '@policysynth/agents/solutions/web/googleSearchApi.js';

const googleSearchApi = new GoogleSearchApi();
googleSearchApi.search("liberal democracies: issues and solutions")
  .then(results => {
    console.log("Search results:", results);
  })
  .catch(error => {
    console.error("An error occurred:", error);
  });
```

## Detailed Method Description

### `search(query: string): Promise<PsSearchResultItem[]>`

Performs a search query using the Google Custom Search API and returns the results.

#### Parameters

- `query` (string): The search query string.

#### Returns

- `Promise<PsSearchResultItem[]>`: A promise that resolves to an array of search result items.

#### Example

```typescript
const googleSearchApi = new GoogleSearchApi();
googleSearchApi.search("liberal democracies: issues and solutions")
  .then(results => {
    console.log("Search results:", results);
  })
  .catch(error => {
    console.error("An error occurred:", error);
  });
```

## Testing

To test the `GoogleSearchApi` class, you can set the environment variables `TEST_GOOGLE_SEARCH`, `GOOGLE_SEARCH_API_KEY`, and `GOOGLE_SEARCH_API_CX_ID`, and then run the script.

```bash
TEST_GOOGLE_SEARCH=true GOOGLE_SEARCH_API_KEY=your_api_key GOOGLE_SEARCH_API_CX_ID=your_cx_id node src/dist/agents/solutions/web/googleSearchApi.js
```

This will execute the `test` function, which performs a search query and logs the results to the console.