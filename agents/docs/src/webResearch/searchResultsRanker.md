# SearchResultsRanker

This class extends `BasePairwiseRankingsProcessor` to rank search results based on their relevance to a given search question.

## Properties

| Name            | Type                      | Description                                   |
|-----------------|---------------------------|-----------------------------------------------|
| searchQuestion  | string \| undefined       | The search question to rank the results for. |

## Methods

| Name               | Parameters                                                                 | Return Type                        | Description                                                                                   |
|--------------------|----------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| voteOnPromptPair   | index: number, promptPair: number[]                                        | Promise<IEnginePairWiseVoteResults>| Analyzes, compares, and ranks a pair of search results based on their relevance.             |
| rankSearchResults  | queriesToRank: IEngineSearchResultItem[], searchQuestion: string, maxPrompts = 150 | Promise<IEngineSearchResultItem[]> | Ranks a list of search results based on their relevance to the search question.               |

## Example

```typescript
import { SearchResultsRanker } from '@policysynth/agents/webResearch/searchResultsRanker.js';
import { PsBaseMemoryData, IEngineSearchResultItem, IEnginePairWiseVoteResults, IEngineConstants } from 'path/to/your/types';

const memoryData: PsBaseMemoryData = /* Initialize your memory data here */;
const searchQuestion = "What is the best programming language for web development?";
const searchResults: IEngineSearchResultItem[] = [
  {
    title: "Python for Web Development",
    description: "Exploring the use of Python in web development.",
    url: "https://example.com/python-web"
  },
  {
    title: "JavaScript: The Language of the Web",
    description: "Why JavaScript is essential for modern web development.",
    url: "https://example.com/javascript-web"
  }
  // Add more search results as needed
];

async function rankSearchResults() {
  const ranker = new SearchResultsRanker(memoryData);
  const rankedResults = await ranker.rankSearchResults(searchResults, searchQuestion);
  console.log(rankedResults);
}

rankSearchResults();
```