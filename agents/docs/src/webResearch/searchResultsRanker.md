# SearchResultsRanker

This class extends `BasePairwiseRankingsProcessor` to rank search results based on their relevance to a given search question.

## Properties

| Name            | Type                             | Description                                   |
|-----------------|----------------------------------|-----------------------------------------------|
| searchQuestion  | string \| undefined              | The search question to rank results against.  |

## Methods

| Name              | Parameters                                                                 | Return Type                        | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| voteOnPromptPair  | index: number, promptPair: number[]                                        | Promise<IEnginePairWiseVoteResults>| Analyzes and ranks a pair of search results based on their relevance to the search question. |
| rankSearchResults | queriesToRank: IEngineSearchResultItem[], searchQuestion: string, maxPrompts = 150 | Promise<IEngineSearchResultItem[]> | Ranks a list of search results based on their relevance to the search question.               |

## Example

```javascript
import { SearchResultsRanker } from '@policysynth/agents/webResearch/searchResultsRanker.js';
import { PsWebResearchMemory } from 'path/to/PsWebResearchMemory';
import { IEngineSearchResultItem, IEnginePairWiseVoteResults } from 'path/to/engineTypes';

const memory = new PsWebResearchMemory();
const searchResultsRanker = new SearchResultsRanker(memory);

const searchResults: IEngineSearchResultItem[] = [
  // Array of search result items to rank
];

const searchQuestion = "What is the best programming language for beginners?";

async function rankSearchResults() {
  const rankedResults = await searchResultsRanker.rankSearchResults(searchResults, searchQuestion);
  console.log(rankedResults);
}

rankSearchResults();
```