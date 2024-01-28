# SearchQueriesRanker

This class extends `BasePairwiseRankingsProcessor` to rank search queries based on their relevance to a user's research question.

## Properties

| Name            | Type                        | Description                                   |
|-----------------|-----------------------------|-----------------------------------------------|
| searchQuestion  | string \| undefined         | The research question to rank the queries for |

## Methods

| Name              | Parameters                                                                 | Return Type                             | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| voteOnPromptPair  | index: number, promptPair: number[]                                        | Promise<IEnginePairWiseVoteResults>     | Ranks a pair of search queries based on their relevance to the search question.               |
| rankSearchQueries | queriesToRank: string[], searchQuestion: string, maxPrompts: number = 120 | Promise<string[]>                       | Ranks a list of search queries based on their relevance to the provided search question.      |

## Example

```typescript
import { SearchQueriesRanker } from '@policysynth/agents/webResearch/searchQueriesRanker.js';
import { PsBaseMemoryData, IEnginePairWiseVoteResults } from 'path/to/types';

const memoryData: PsBaseMemoryData = {/* Memory data structure */};
const searchQuestion = "What are the latest advancements in AI research?";
const queriesToRank = [
  "AI research breakthroughs 2023",
  "History of AI",
  "Future predictions for AI technology"
];

async function rankQueries() {
  const ranker = new SearchQueriesRanker(memoryData);
  const rankedQueries = await ranker.rankSearchQueries(queriesToRank, searchQuestion);
  console.log(rankedQueries);
}

rankQueries();
```