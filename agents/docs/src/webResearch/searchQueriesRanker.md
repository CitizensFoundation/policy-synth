# SearchQueriesRanker

This class is responsible for ranking search queries based on their relevance to a given research question. It extends the `BasePairwiseRankingsProcessor` class.

## Properties

| Name            | Type                        | Description                                   |
|-----------------|-----------------------------|-----------------------------------------------|
| searchQuestion  | string \| undefined         | The research question to rank the queries for |

## Methods

| Name              | Parameters                                                                 | Return Type                             | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| voteOnPromptPair  | index: number, promptPair: number[]                                        | Promise<IEnginePairWiseVoteResults>     | Ranks a pair of search queries based on their relevance to the research question.             |
| rankSearchQueries | queriesToRank: string[], searchQuestion: string, maxPrompts: number = 120 | Promise<string[]>                       | Ranks a list of search queries based on their relevance to the provided research question.   |

## Example

```javascript
// Example usage of SearchQueriesRanker
import { SearchQueriesRanker } from '@policysynth/agents/webResearch/searchQueriesRanker.js';
import { PsWebResearchMemory } from 'path/to/PsWebResearchMemory';
import { IEngineConstants } from 'path/to/constants.js';

const memory = new PsWebResearchMemory();
const searchQuestion = "What are the latest trends in AI research?";
const queriesToRank = [
  "AI research trends 2023",
  "Latest AI breakthroughs",
  "AI historical milestones"
];

const ranker = new SearchQueriesRanker(memory);
ranker.rankSearchQueries(queriesToRank, searchQuestion).then(rankedQueries => {
  console.log("Ranked Queries:", rankedQueries);
});
```