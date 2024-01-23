# BingSearchApi

The `BingSearchApi` class extends the `PolicySynthAgentBase` class and is responsible for searching queries using the Bing Search API. It requires an Azure Bing Search API key to be set in the environment variables. The class also implements caching of search results using Redis.

## Properties

| Name              | Type   | Description                                   |
|-------------------|--------|-----------------------------------------------|
| SUBSCRIPTION_KEY  | string \| undefined | The subscription key for the Bing Search API, obtained from the environment variable `AZURE_BING_SEARCH_KEY`. |

## Methods

| Name    | Parameters       | Return Type                        | Description                                                                                   |
|---------|------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| search  | query: string    | Promise<IEngineSearchResultItem[]> | Performs a search using the Bing Search API with the provided query and returns search results. |

## Examples

```typescript
// Example usage of the BingSearchApi class
const bingSearchApi = new BingSearchApi();

bingSearchApi.search("example query")
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error(error);
  });
```