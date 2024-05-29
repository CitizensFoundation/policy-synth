# RankRootCausesSearchQueriesProcessor

The `RankRootCausesSearchQueriesProcessor` class is responsible for ranking search queries related to root causes of a problem statement. It extends the `BasePairwiseRankingsProcessor` class and utilizes the OpenAI API to perform the ranking.

## Properties

| Name           | Type   | Description                                                                 |
|----------------|--------|-----------------------------------------------------------------------------|
| rootCauseTypes | string[] | An array of different types of root causes to be ranked.                    |

## Methods

| Name            | Parameters                                                                 | Return Type                    | Description                                                                                       |
|-----------------|----------------------------------------------------------------------------|--------------------------------|---------------------------------------------------------------------------------------------------|
| voteOnPromptPair | index: number, promptPair: number[]                                       | Promise<IEnginePairWiseVoteResults> | Asynchronously votes on a pair of prompts to determine which is more relevant.                    |
| process         | None                                                                       | Promise<void>                  | Asynchronously processes the ranking of root cause search queries for each type in `rootCauseTypes`. |

## Example

```typescript
import { RankRootCausesSearchQueriesProcessor } from '@policysynth/agents/problems/ranking/rankRootCausesSearchQueries.js';

const processor = new RankRootCausesSearchQueriesProcessor();
processor.process();
```

This class uses the `ChatOpenAI` from the `@langchain/openai` package and `HumanMessage` and `SystemMessage` from the `@langchain/core/messages` package to interact with the OpenAI API for ranking the search queries. The `process` method iterates over different root cause types, sets up ranking prompts, performs pairwise ranking, and updates the memory with the ordered list of search queries.