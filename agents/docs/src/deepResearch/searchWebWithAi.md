# BaseSearchWebAgentWithAi

A base agent class for performing web searches using AI, supporting both Google and Bing search APIs. This agent is designed to be extended for more advanced research and information retrieval tasks. It manages deduplication of search results and abstracts away the details of which search API is used, depending on available credentials.

**File:** `@policysynth/agents/deepResearch/searchWebWithAi.js`

## Properties

| Name      | Type                                 | Description                                                                 |
|-----------|--------------------------------------|-----------------------------------------------------------------------------|
| seenUrls  | Map\<string, Set\<string\>\>         | Tracks URLs already seen for a given search session (by `id`) to deduplicate results. |

## Constructor

```typescript
constructor(agent: PsAgent, memory: PsAgentMemoryData)
```

- **agent**: `PsAgent`  
  The agent instance from the database.
- **memory**: `PsAgentMemoryData`  
  The memory object for the agent, used for stateful operations.

## Methods

| Name             | Parameters                                                                                                 | Return Type                       | Description                                                                                                    |
|------------------|-----------------------------------------------------------------------------------------------------------|-----------------------------------|----------------------------------------------------------------------------------------------------------------|
| callSearchApi    | query: string, numberOfResults: number, options?: PsSearchOptions                                          | Promise\<PsSearchResultItem[]\>   | Calls the appropriate search API (Google or Bing) based on environment variables and returns search results.   |
| getQueryResults  | queriesToSearch: string[], id: string, numberOfResults?: number, options?: PsSearchOptions                 | Promise<{ searchResults: PsSearchResultItem[] }> | Runs multiple queries, aggregates and deduplicates results, and returns them.                                  |

### Method Details

#### callSearchApi

Calls either the Google Search API or Bing Search API depending on which credentials are available in the environment. Throws an error if neither is available.

- **query**: The search query string.
- **numberOfResults**: Number of results to fetch.
- **options**: (Optional) Additional search options (see `PsSearchOptions`).

**Returns:**  
A promise resolving to an array of `PsSearchResultItem`.

#### getQueryResults

Performs multiple search queries, aggregates the results, and deduplicates them based on URLs for the given session `id`.

- **queriesToSearch**: Array of search query strings.
- **id**: Unique identifier for the search session (used for deduplication).
- **numberOfResults**: (Optional) Number of results per query (default: 10).
- **options**: (Optional) Additional search options.

**Returns:**  
A promise resolving to an object:  
```typescript
{ searchResults: PsSearchResultItem[] }
```

## Example

```typescript
import { BaseSearchWebAgentWithAi } from '@policysynth/agents/deepResearch/searchWebWithAi.js';
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';

// Assume you have a PsAgent instance and memory object
const agent: PsAgent = /* ... */;
const memory: PsAgentMemoryData = /* ... */;

const searchAgent = new BaseSearchWebAgentWithAi(agent, memory);

const queries = [
  "AI policy frameworks",
  "Recent AI regulation news"
];

const sessionId = "session-123";

searchAgent.getQueryResults(queries, sessionId, 5)
  .then(({ searchResults }) => {
    console.log("Aggregated and deduplicated search results:", searchResults);
  })
  .catch(err => {
    console.error("Search failed:", err);
  });
```

---

**Note:**  
- The agent will use Google Search if `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_API_CX_ID` are set in the environment, otherwise it will use Bing Search if `AZURE_BING_SEARCH_KEY` is set.
- Deduplication is performed per session `id` to avoid repeated URLs in the results.