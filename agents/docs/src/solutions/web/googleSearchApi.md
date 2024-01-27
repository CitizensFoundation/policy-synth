# GoogleSearchApi

This class extends `PolicySynthAgentBase` and provides functionality to search the web using the Google Custom Search JSON API.

## Methods

| Name   | Parameters       | Return Type                        | Description |
|--------|------------------|------------------------------------|-------------|
| search | query: string    | Promise<IEngineSearchResultItem[]> | Performs a web search using the Google Custom Search JSON API and returns an array of search result items. |

## Example

```javascript
import { GoogleSearchApi } from '@policysynth/agents/solutions/web/googleSearchApi.js';

async function performSearch() {
  const googleSearchApi = new GoogleSearchApi();
  try {
    const results = await googleSearchApi.search("example query");
    console.log("Search results:", results);
  } catch (error) {
    console.error("Search failed:", error);
  }
}

performSearch();
```

**Note:** To use this example, you need to have valid `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_API_CX_ID` environment variables set.