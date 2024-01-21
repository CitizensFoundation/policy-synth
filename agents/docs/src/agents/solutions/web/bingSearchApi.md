# BingSearchApi

The `BingSearchApi` class is responsible for performing searches using the Bing Search API and caching the results in Redis. It extends the `Base` class and requires the `AZURE_BING_SEARCH_KEY` environment variable to be set.

## Properties

| Name              | Type   | Description                                   |
|-------------------|--------|-----------------------------------------------|
| SUBSCRIPTION_KEY  | string \| undefined | The subscription key for the Bing Search API, obtained from the environment variable. |

## Methods

| Name    | Parameters        | Return Type                         | Description                                                                 |
|---------|-------------------|-------------------------------------|-----------------------------------------------------------------------------|
| search  | query: string     | Promise<IEngineSearchResultItem[]>  | Performs a search with the given query string and returns search results.   |

## Examples

```typescript
// Example usage of BingSearchApi
const bingSearchApi = new BingSearchApi();
const searchResults = await bingSearchApi.search('example query');
```