# SearchResultsRanker

The `SearchResultsRanker` class extends the `SimplePairwiseRankingsAgent` to rank search results based on their relevance to a given research question. It uses a pairwise comparison approach to determine the most relevant search results.

## Properties

| Name             | Type                          | Description                                      |
|------------------|-------------------------------|--------------------------------------------------|
| searchQuestion   | `string \| undefined`         | The research question used to rank search results. |
| progressFunction | `Function \| undefined`       | A function to track the progress of the ranking process. |

## Constructor

### `constructor(memory: PsSimpleAgentMemoryData, progressFunction: Function | undefined = undefined)`

Creates an instance of `SearchResultsRanker`.

| Parameter        | Type                          | Description                                      |
|------------------|-------------------------------|--------------------------------------------------|
| memory           | `PsSimpleAgentMemoryData`     | The memory data for the agent.                   |
| progressFunction | `Function \| undefined`       | A function to track the progress of the ranking process. |

## Methods

### `async voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>`

Compares two search results and determines which one is more relevant to the research question.

| Parameter  | Type        | Description                                      |
|------------|-------------|--------------------------------------------------|
| index      | `number`    | The index of the current ranking process.        |
| promptPair | `number[]`  | An array containing the indices of the two search results to compare. |

**Returns:** `Promise<PsPairWiseVoteResults>` - The result of the pairwise vote.

### `async rankSearchResults(queriesToRank: PsSearchResultItem[], searchQuestion: string, maxPrompts = 150)`

Ranks a list of search results based on their relevance to the given research question.

| Parameter      | Type                    | Description                                      |
|----------------|-------------------------|--------------------------------------------------|
| queriesToRank  | `PsSearchResultItem[]`  | An array of search results to rank.              |
| searchQuestion | `string`                | The research question used to rank search results. |
| maxPrompts     | `number`                | The maximum number of prompts to use for ranking. Default is 150. |

**Returns:** `Promise<PsSearchResultItem[]>` - The ordered list of ranked search results.

## Example

```typescript
import { SearchResultsRanker } from '@policysynth/agents/webResearch/searchResultsRanker.js';

const memory: PsSimpleAgentMemoryData = {
  // Initialize memory data
};

const ranker = new SearchResultsRanker(memory);

const searchResults: PsSearchResultItem[] = [
  {
    title: "Result 1",
    originalPosition: 1,
    description: "Description of result 1",
    url: "http://example.com/1",
    date: "2023-10-01"
  },
  {
    title: "Result 2",
    originalPosition: 2,
    description: "Description of result 2",
    url: "http://example.com/2",
    date: "2023-10-02"
  }
];

const rankedResults = await ranker.rankSearchResults(searchResults, "What is the best way to learn TypeScript?");
console.log(rankedResults);
```

This example demonstrates how to use the `SearchResultsRanker` class to rank search results based on a research question. The `rankSearchResults` method is called with a list of search results and a research question, and it returns the ranked results.