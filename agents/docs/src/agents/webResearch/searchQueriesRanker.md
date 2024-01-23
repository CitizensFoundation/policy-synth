# SearchQueriesRanker

The `SearchQueriesRanker` class extends the `BasePairwiseRankingsProcessor` class and is designed to rank search queries based on their relevance to complex problem statements, sub-problems, and affected entities. It uses a language model to analyze and compare search queries and outputs a ranking.

## Properties

| Name             | Type                      | Description                                       |
|------------------|---------------------------|---------------------------------------------------|
| progressFunction | Function \| undefined     | A function that can be used to track progress.    |
| searchQuestion   | string \| undefined       | The search question that the queries relate to.   |

## Methods

| Name              | Parameters                                  | Return Type                          | Description                                                                                   |
|-------------------|---------------------------------------------|--------------------------------------|-----------------------------------------------------------------------------------------------|
| voteOnPromptPair  | index: number, promptPair: number[]         | Promise<IEnginePairWiseVoteResults>  | Analyzes and ranks a pair of search queries based on their relevance to the search question.   |
| rankSearchQueries | queriesToRank: string[], searchQuestion: string, maxPrompts: number | Promise<string[]> | Ranks a list of search queries based on their relevance to the provided search question.      |

## Examples

```typescript
// Example usage of SearchQueriesRanker
const progressFunction = (progress: number) => {
  console.log(`Ranking progress: ${progress}%`);
};

const ranker = new SearchQueriesRanker(progressFunction);
const searchQuestion = "How to reduce carbon footprint in urban areas?";
const queriesToRank = [
  "urban carbon footprint reduction",
  "carbon footprint",
  "urban areas carbon footprint",
  "reducing pollution in cities"
];

async function rankQueries() {
  const rankedQueries = await ranker.rankSearchQueries(queriesToRank, searchQuestion);
  console.log(rankedQueries);
}

rankQueries();
```