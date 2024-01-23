# SearchResultsRanker

The `SearchResultsRanker` class extends the `BasePairwiseRankingsProcessor` to rank search results based on their relevance to a given search question. It is designed to interact with an AI model to determine the most relevant search results.

## Properties

| Name             | Type                      | Description                                           |
|------------------|---------------------------|-------------------------------------------------------|
| searchQuestion   | string \| undefined       | The search question used to rank the search results.  |
| progressFunction | Function \| undefined     | A function that can be called to report progress.     |

## Methods

| Name              | Parameters                                  | Return Type                     | Description                                                                                   |
|-------------------|---------------------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------|
| voteOnPromptPair  | index: number, promptPair: number[]         | Promise<IEnginePairWiseVoteResults> | Asynchronously votes on a pair of prompts to determine their relevance to the search question. |
| rankSearchResults | queriesToRank: IEngineSearchResultItem[], searchQuestion: string, maxPrompts: number | Promise<IEngineSearchResultItem[]> | Asynchronously ranks search results based on their relevance to the search question.           |

## Examples

```typescript
// Example usage of SearchResultsRanker
const searchResultsRanker = new SearchResultsRanker();

// Define a search question
const searchQuestion = "What are the root causes of climate change?";

// Define search result items to rank
const searchResultItems: IEngineSearchResultItem[] = [
  {
    title: "Climate Change Causes",
    description: "An overview of the natural and human factors that contribute to climate change.",
    url: "https://example.com/climate-change-causes"
  },
  {
    title: "Global Warming",
    description: "Exploring the effects of greenhouse gases on global temperatures.",
    url: "https://example.com/global-warming"
  }
  // ... more items
];

// Rank the search results
const rankedResults = await searchResultsRanker.rankSearchResults(searchResultItems, searchQuestion);

// Output the ranked results
console.log(rankedResults);
```

Note: The `IEnginePairWiseVoteResults` and `IEngineSearchResultItem` types are assumed to be defined elsewhere in the codebase and are used here to represent the structure of the expected input and output data.