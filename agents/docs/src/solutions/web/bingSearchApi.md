# BingSearchApi

This class provides functionality to perform search queries using the Bing Search API and handles caching of results using Redis.

## Properties

| Name              | Type                  | Description                                   |
|-------------------|-----------------------|-----------------------------------------------|
| SUBSCRIPTION_KEY  | string \| undefined   | The subscription key for the Bing Search API. |

## Methods

| Name   | Parameters        | Return Type                         | Description |
|--------|-------------------|-------------------------------------|-------------|
| search | query: string     | Promise<IEngineSearchResultItem[]> | Performs a search using the Bing Search API and caches the results in Redis. Handles retries and logs detailed information about the search process and results. |

## Example

```typescript
import { BingSearchApi } from '@policysynth/agents/solutions/web/bingSearchApi.js';

const bingSearchApi = new BingSearchApi();
const searchQuery = "example search query";

bingSearchApi.search(searchQuery)
  .then(results => {
    console.log("Search Results:", results);
  })
  .catch(error => {
    console.error("Error performing search:", error);
  });
```