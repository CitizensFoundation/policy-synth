# SearchResultsRanker

The `SearchResultsRanker` class extends `BasePairwiseRankingsProcessor` to rank search results based on their relevance to a given research question using pairwise comparison.

## Properties

| Name           | Type                  | Description                                   |
|----------------|-----------------------|-----------------------------------------------|
| searchQuestion | string \| undefined   | The current research question for ranking.    |

## Methods

| Name              | Parameters                                             | Return Type                     | Description                                                                 |
|-------------------|--------------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair  | index: number, promptPair: number[]                    | Promise<PsPairWiseVoteResults> | Processes a pair of prompts and returns the ranking results.                |
| rankSearchResults | queriesToRank: PsSearchResultItem[], searchQuestion: string, maxPrompts: number = 150 | Promise<PsSearchResultItem[]> | Ranks a list of search results based on their relevance to the search question. |

## Example

```typescript
import { SearchResultsRanker } from '@policysynth/agents/webResearch/searchResultsRanker.js';
import { PsSearchResultItem } from '../types.js'; // Assuming the type is defined in types.js

async function rankSearchResultsExample() {
  const searchQuestion = "What is the best approach to learn TypeScript?";
  const searchResults: PsSearchResultItem[] = [
    { title: "TypeScript Basics", description: "Learn the basics of TypeScript.", url: "https://example.com/ts-basics" },
    { title: "Advanced TypeScript", description: "Deep dive into advanced TypeScript topics.", url: "https://example.com/advanced-ts" }
  ];

  const ranker = new SearchResultsRanker();
  const rankedResults = await ranker.rankSearchResults(searchResults, searchQuestion);
  console.log(rankedResults);
}

rankSearchResultsExample();
```