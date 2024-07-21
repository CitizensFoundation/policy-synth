# ResearchWeb

The `ResearchWeb` class extends the `BaseSearchWebAgent` and is designed to perform web searches based on provided search queries. It utilizes a memory object to keep track of the agent's state and logs the search process.

## Properties

| Name      | Type                        | Description                        |
|-----------|-----------------------------|------------------------------------|
| memory    | PsSimpleAgentMemoryData     | Memory object to track agent state |
| seenUrls  | Map<string, boolean>        | Map to track seen URLs             |
| logger    | any                         | Logger for logging information     |

## Methods

| Name       | Parameters                | Return Type         | Description                          |
|------------|---------------------------|---------------------|--------------------------------------|
| constructor| memory: PsSimpleAgentMemoryData | void                | Initializes the `ResearchWeb` instance with memory |
| search     | searchQueries: string[]   | Promise<SearchResultItem[]> | Performs web search based on provided queries |

## Example

```typescript
import { ResearchWeb } from '@policysynth/agents/webResearch/researchWeb.js';

const memory: PsSimpleAgentMemoryData = {
  groupId: 1,
  status: {
    state: "running",
    progress: 0,
    messages: [],
    lastUpdated: Date.now(),
  },
};

const researchAgent = new ResearchWeb(memory);

const searchQueries = ["AI research", "machine learning trends"];
researchAgent.search(searchQueries).then(results => {
  console.log(results);
});
```

## Detailed Description

### Constructor

The constructor initializes the `ResearchWeb` instance with a memory object.

#### Parameters

- `memory`: An object of type `PsSimpleAgentMemoryData` that keeps track of the agent's state.

### search

The `search` method performs a web search based on the provided search queries. It logs the search process and keeps track of seen URLs to avoid duplicate results.

#### Parameters

- `searchQueries`: An array of strings representing the search queries.

#### Returns

- A promise that resolves to an array of `SearchResultItem` objects containing the search results.