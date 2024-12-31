# BaseSearchWebAgentWithAi

The `BaseSearchWebAgentWithAi` class is an extension of the `PolicySynthAgent` class, designed to perform web searches using AI. It utilizes either the Google Search API or the Bing Search API to fetch search results based on provided queries.

## Properties

| Name     | Type                              | Description                                      |
|----------|-----------------------------------|--------------------------------------------------|
| seenUrls | Map<string, Set<string>>          | A map to track URLs that have been seen for deduplication purposes. |

## Constructor

### BaseSearchWebAgentWithAi

Creates an instance of `BaseSearchWebAgentWithAi`.

#### Parameters

- `agent`: `PsAgent` - The agent instance.
- `memory`: `PsAgentMemoryData` - The memory data for the agent.

## Methods

### callSearchApi

Performs a search using either the Google Search API or the Bing Search API, depending on the available environment variables.

#### Parameters

- `query`: `string` - The search query.
- `numberOfResults`: `number` - The number of results to fetch.

#### Returns

- `Promise<PsSearchResultItem[]>` - A promise that resolves to an array of search result items.

#### Throws

- `Error` - If no search API key is available.

### getQueryResults

Fetches search results for a list of queries and deduplicates the results based on previously seen URLs.

#### Parameters

- `queriesToSearch`: `string[]` - An array of search queries.
- `id`: `string` - An identifier used to track seen URLs.
- `numberOfResults`: `number` (optional) - The number of results to fetch per query. Defaults to 10.

#### Returns

- `Promise<{ searchResults: PsSearchResultItem[] }>` - A promise that resolves to an object containing the search results.

## Example

```typescript
import { BaseSearchWebAgentWithAi } from '@policysynth/agents/webResearch/searchWebWithAi.js';

const agent = new PsAgent(/* agent initialization */);
const memory = {/* memory initialization */};

const searchAgent = new BaseSearchWebAgentWithAi(agent, memory);

const queries = ["example query 1", "example query 2"];
const results = await searchAgent.getQueryResults(queries, "uniqueId");

console.log(results.searchResults);
```

This class is useful for performing web searches with AI, leveraging either Google or Bing search APIs, and ensuring that duplicate URLs are filtered out from the results.