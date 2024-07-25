# BingSearchApi

The `BingSearchApi` class is a simple agent that interacts with the Bing Search API to perform web searches. It extends the `PolicySynthSimpleAgentBase` class.

## Properties

| Name              | Type   | Description                                      |
|-------------------|--------|--------------------------------------------------|
| SUBSCRIPTION_KEY  | string | The subscription key for the Bing Search API.    |

## Methods

| Name    | Parameters        | Return Type                | Description                                                                 |
|---------|-------------------|----------------------------|-----------------------------------------------------------------------------|
| search  | query: string     | Promise<PsSearchResultItem[]> | Performs a search query using the Bing Search API and returns the results.  |

## Example

```typescript
import { BingSearchApi } from '@policysynth/agents/webResearch/bingSearchApi.js';

const bingSearchApi = new BingSearchApi();

bingSearchApi.search("example query")
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error(error);
  });
```

## Detailed Description

### Constructor

The constructor initializes the `BingSearchApi` instance and sets the `SUBSCRIPTION_KEY` from the environment variable `AZURE_BING_SEARCH_KEY`. If the environment variable is not set, it throws an error.

```typescript
constructor() {
  super();
  this.SUBSCRIPTION_KEY = process.env.AZURE_BING_SEARCH_KEY;

  if (!this.SUBSCRIPTION_KEY) {
    throw new Error("Missing the AZURE_BING_SEARCH_KEY environment variable");
  }
}
```

### search

The `search` method performs a search query using the Bing Search API and returns the results as an array of `PsSearchResultItem`.

#### Parameters

- `query` (string): The search query string.

#### Returns

- `Promise<PsSearchResultItem[]>`: A promise that resolves to an array of search result items.

#### Implementation

The method constructs the request parameters, including the search query and headers. It then makes a GET request to the Bing Search API. If the request is successful, it processes the response and extracts the search results. If the request fails, it retries up to a maximum number of retries specified by the environment variable `PS_SEARCH_MAX_RETRIES`.

```typescript
public async search(query: string): Promise<PsSearchResultItem[]> {
  const maxBingResults = process.env.PS_MAX_BING_RESULTS ? parseInt(process.env.PS_MAX_BING_RESULTS) : 10;
  const requestParams: AxiosRequestConfig = {
    method: "GET",
    url:
      `https://api.cognitive.microsoft.com/bing/v7.0/search?count=${maxBingResults}&q=` +
      encodeURIComponent(query),
    headers: {
      "Ocp-Apim-Subscription-Key": this.SUBSCRIPTION_KEY!,
    },
  };

  const outResults: PsSearchResultItem[] = [];
  let retry = true;
  const maxRetries = process.env.PS_SEARCH_MAX_RETRIES
    ? parseInt(process.env.PS_SEARCH_MAX_RETRIES)
    : 3;
  let retryCount = 0;

  while (retry && retryCount < maxRetries) {
    try {
      const res = await axios(requestParams);
      const body = res.data;

      Object.keys(res.headers).forEach((header) => {
        if (
          header.startsWith("bingapis-") ||
          header.startsWith("x-msedge-")
        ) {
          console.log(`${header}: ${res.headers[header]}`);
        }
      });

      this.logger.debug("\nBing Search JSON Response:\n");
      this.logger.debug(JSON.stringify(body, null, "  "));

      if (body.webPages) {
        for (let i = 0; i < body.webPages.value.length; i++) {
          outResults.push({
            originalPosition: i + 1,
            title: body.webPages.value[i].name,
            url: body.webPages.value[i].url,
            description: body.webPages.value[i].snippet,
            date: body.webPages.value[i].dateLastCrawled,
          });
        }
      }
    } catch (e: any) {
      this.logger.error(`Failed to get search data for ${query}`);
      this.logger.error("Bing Search Error: " + e.message);
      this.logger.error(e);
      if (retryCount < maxRetries) {
        retry = false;
        throw e;
      } else {
        await new Promise((resolve) =>
          setTimeout(resolve, 5000 + retryCount * 5000)
        );
        retryCount++;
      }
    }
  }

  return outResults;
}
```

This method ensures that the search query is retried in case of failure, with a delay between retries. The search results are logged and returned as an array of `PsSearchResultItem`.