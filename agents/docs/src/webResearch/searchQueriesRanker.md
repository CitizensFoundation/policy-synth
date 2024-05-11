# SearchQueriesRanker

This class extends `BasePairwiseRankingsProcessor` to rank search queries based on their relevance to a given research question using a language model.

## Properties

| Name            | Type                  | Description                                       |
|-----------------|-----------------------|---------------------------------------------------|
| searchQuestion  | string \| undefined   | The current research question for ranking queries |

## Methods

| Name              | Parameters                                             | Return Type                        | Description                                                                 |
|-------------------|--------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| constructor       | memory: PsBaseMemoryData, progressFunction?: Function  | void                               | Initializes a new instance of the SearchQueriesRanker with optional progress function. |
| voteOnPromptPair  | index: number, promptPair: number[]                    | Promise<IEnginePairWiseVoteResults>| Processes a pair of prompts and returns the ranking results.                |
| rankSearchQueries | queriesToRank: string[], searchQuestion: string, maxPrompts: number = 120 | Promise<string[]> | Ranks a list of search queries based on their relevance to the specified research question. |

## Example

```typescript
import { SearchQueriesRanker } from '@policysynth/agents/webResearch/searchQueriesRanker.js';
import { PsBaseMemoryData } from '@policysynth/agents/memoryDataTypes.js';
import { IEngineConstants } from '../constants.js';

const memoryData: PsBaseMemoryData = {
  // example memory data
};

const ranker = new SearchQueriesRanker(memoryData);

const queries = ["query one", "query two", "query three"];
const researchQuestion = "What is the impact of AI on society?";

async function rankQueries() {
  const rankedQueries = await ranker.rankSearchQueries(queries, researchQuestion);
  console.log(rankedQueries);
}

rankQueries();
```