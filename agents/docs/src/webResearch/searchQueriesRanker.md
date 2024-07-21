# SearchQueriesRanker

The `SearchQueriesRanker` class extends the `SimplePairwiseRankingsAgent` to rank search queries based on their relevance to a given research question. It uses pairwise comparisons to determine the most relevant search queries.

## Properties

| Name             | Type                        | Description                                                                 |
|------------------|-----------------------------|-----------------------------------------------------------------------------|
| searchQuestion   | string \| undefined         | The research question to which the search queries are being ranked against. |
| progressFunction | Function \| undefined       | A function to track the progress of the ranking process.                    |

## Constructor

### `constructor(memory: PsSimpleAgentMemoryData, progressFunction: Function | undefined = undefined)`

Creates an instance of the `SearchQueriesRanker` class.

#### Parameters

- `memory`: `PsSimpleAgentMemoryData` - The memory data for the agent.
- `progressFunction`: `Function | undefined` - An optional function to track the progress of the ranking process.

## Methods

### `async voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>`

Compares two search queries and determines which one is more relevant to the research question.

#### Parameters

- `index`: `number` - The index of the current ranking process.
- `promptPair`: `number[]` - An array containing the indices of the two search queries to compare.

#### Returns

- `Promise<PsPairWiseVoteResults>` - The result of the pairwise vote, indicating which search query is more relevant.

### `async rankSearchQueries(queriesToRank: string[], searchQuestion: string, maxPrompts = 120)`

Ranks a list of search queries based on their relevance to a given research question.

#### Parameters

- `queriesToRank`: `string[]` - An array of search queries to rank.
- `searchQuestion`: `string` - The research question to which the search queries are being ranked against.
- `maxPrompts`: `number` - The maximum number of prompts to use for the ranking process (default is 120).

#### Returns

- `Promise<string[]>` - An ordered list of search queries ranked by their relevance to the research question.

## Example

```typescript
import { SearchQueriesRanker } from '@policysynth/agents/webResearch/searchQueriesRanker.js';

const memory: PsSimpleAgentMemoryData = {
  groupId: 1,
  status: {
    state: "running",
    progress: 0,
    messages: [],
    lastUpdated: Date.now(),
  },
};

const searchQueriesRanker = new SearchQueriesRanker(memory);

const queriesToRank = [
  "How to improve search engine optimization?",
  "Best practices for SEO in 2023",
  "SEO tips and tricks",
];

const searchQuestion = "What are the latest trends in SEO?";

searchQueriesRanker.rankSearchQueries(queriesToRank, searchQuestion).then((rankedQueries) => {
  console.log("Ranked Queries:", rankedQueries);
});
```

This example demonstrates how to create an instance of the `SearchQueriesRanker` class, provide it with a list of search queries and a research question, and then rank the search queries based on their relevance to the research question.