# GoogleSearchApi

This class provides methods to interact with the Google Custom Search API to perform searches and process the results.

## Properties

No public properties are documented.

## Methods

| Name   | Parameters        | Return Type                        | Description |
|--------|-------------------|------------------------------------|-------------|
| search | query: string     | Promise<IEngineSearchResultItem[]> | Performs a search using the Google Custom Search API and processes the results into a structured format. |

## Example

```typescript
import { GoogleSearchApi } from '@policysynth/agents/solutions/web/googleSearchApi.js';

async function performSearch() {
  const googleSearchApi = new GoogleSearchApi();
  try {
    const results = await googleSearchApi.search("example query");
    console.log("Search results:", results);
  } catch (error) {
    console.error("Error during search:", error);
  }
}

performSearch();
```