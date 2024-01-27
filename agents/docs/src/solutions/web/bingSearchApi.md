# BingSearchApi

This class is responsible for performing searches using the Bing Search API and caching the results in Redis. It extends the `PolicySynthAgentBase` class.

## Properties

| Name              | Type                      | Description                                           |
|-------------------|---------------------------|-------------------------------------------------------|
| SUBSCRIPTION_KEY  | string \| undefined       | The subscription key for the Bing Search API.         |

## Methods

| Name    | Parameters            | Return Type                     | Description                                                                 |
|---------|-----------------------|---------------------------------|-----------------------------------------------------------------------------|
| search  | query: string         | Promise<IEngineSearchResultItem[]> | Performs a search using the Bing Search API and returns the search results. |

## Example

```javascript
import { BingSearchApi } from '@policysynth/agents/solutions/web/bingSearchApi.js';

const bingSearchApi = new BingSearchApi();

bingSearchApi.search("example query")
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error("Search failed:", error);
  });
```