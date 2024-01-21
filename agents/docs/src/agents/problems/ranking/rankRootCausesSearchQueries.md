# RankRootCausesSearchQueriesProcessor

This class is responsible for ranking root cause search queries based on their relevance to a given problem statement and its root causes.

## Properties

| Name            | Type   | Description               |
|-----------------|--------|---------------------------|
| rootCauseTypes  | string[] | List of root cause types. |

## Methods

| Name              | Parameters                        | Return Type                     | Description                                                                 |
|-------------------|-----------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair  | index: number, promptPair: number[] | Promise<IEnginePairWiseVoteResults> | Votes on which of the two provided search queries is more relevant.         |
| process           | -                                 | void                            | Processes the ranking of search queries for each root cause type.           |

## Examples

```typescript
// Example usage of RankRootCausesSearchQueriesProcessor
const rankProcessor = new RankRootCausesSearchQueriesProcessor();
await rankProcessor.process();
```