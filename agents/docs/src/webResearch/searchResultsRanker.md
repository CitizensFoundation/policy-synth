# SearchResultsRanker

The `SearchResultsRanker` class is designed to rank search results based on their relevance to a given research question. It extends the `SimplePairwiseRankingsAgent` class and utilizes pairwise comparison to determine the most relevant search results.

## Properties

| Name            | Type                          | Description                                      |
|-----------------|-------------------------------|--------------------------------------------------|
| searchQuestion  | `string \| undefined`         | The research question used to rank search results. |

## Constructor

### SearchResultsRanker

Creates an instance of `SearchResultsRanker`.

#### Parameters

- `memory`: `PsSimpleAgentMemoryData` - The memory data for the agent.
- `progressFunction`: `Function \| undefined` - An optional function to track progress.

## Methods

### voteOnPromptPair

Compares two search results and determines which one is more relevant to the research question.

#### Parameters

- `index`: `number` - The index of the current comparison.
- `promptPair`: `number[]` - An array containing the indices of the two search results to compare.

#### Returns

- `Promise<PsPairWiseVoteResults>` - The result of the pairwise vote, indicating which search result is more relevant.

### rankSearchResults

Ranks a list of search results based on their relevance to a research question.

#### Parameters

- `queriesToRank`: `PsSearchResultItem[]` - An array of search results to rank.
- `searchQuestion`: `string` - The research question to use for ranking.
- `maxPrompts`: `number` - The maximum number of prompts to use for ranking (default is 150).

#### Returns

- `Promise<PsSearchResultItem[]>` - An ordered list of search results ranked by relevance.

## Example

```typescript
import { SearchResultsRanker } from '@policysynth/agents/webResearch/searchResultsRanker.js';

const memoryData: PsSimpleAgentMemoryData = { groupId: 1 };
const ranker = new SearchResultsRanker(memoryData);

const searchResults: PsSearchResultItem[] = [
  { title: "Result 1", originalPosition: 1, description: "Description 1", url: "http://example.com/1", date: "2023-10-01" },
  { title: "Result 2", originalPosition: 2, description: "Description 2", url: "http://example.com/2", date: "2023-10-02" }
];

const rankedResults = await ranker.rankSearchResults(searchResults, "What is the best way to learn TypeScript?");
console.log(rankedResults);
```

This class is useful for applications that require automated ranking of search results based on specific criteria, such as relevance to a research question.