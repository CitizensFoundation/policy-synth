# BingSearchApi

The `BingSearchApi` class is a specialized agent that extends the `PolicySynthSimpleAgentBase` class. It is designed to interact with the Bing Search API to perform web searches and retrieve search results.

## Properties

| Name              | Type   | Description                                                                 |
|-------------------|--------|-----------------------------------------------------------------------------|
| SUBSCRIPTION_KEY  | string | The subscription key for accessing the Bing Search API, retrieved from the environment variable `AZURE_BING_SEARCH_KEY`. |

## Constructor

The constructor initializes the `BingSearchApi` instance and retrieves the subscription key from the environment variables. If the subscription key is not found, it throws an error.

## Methods

### search

Performs a search query using the Bing Search API and returns the search results.

| Name       | Parameters                  | Return Type          | Description                                                                 |
|------------|-----------------------------|----------------------|-----------------------------------------------------------------------------|
| search     | query: string, numberOfResults: number, options?: PsSearchOptions | Promise<PsSearchResultItem[]> | Executes a search query and returns an array of search result items. |

#### Parameters

- `query` (string): The search query string.
- `numberOfResults` (number): The number of search results to retrieve. The Bing API allows specifying a count up to a certain limit (commonly 50).
- `options?` (`PsSearchOptions`): Optional search modifiers such as `before` or `after` dates.

#### Return Type

- Returns a promise that resolves to an array of `PsSearchResultItem` objects, each representing a search result.

#### Example

```typescript
import { BingSearchApi } from '@policysynth/agents/webResearch/bingSearchApi.js';

const bingSearch = new BingSearchApi();
bingSearch.search("example query", 10, { before: "2024/01/01" })
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error("Error performing search:", error);
  });
```

## Usage

To use the `BingSearchApi` class, you need to have the `AZURE_BING_SEARCH_KEY` environment variable set with a valid subscription key for the Bing Search API. You can then create an instance of the `BingSearchApi` class and call the `search` method with your desired query and number of results. The method will return a promise that resolves to an array of search results.