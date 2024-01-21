# RankSubProblemsProcessor

The `RankSubProblemsProcessor` class is responsible for ranking sub-problems based on their relevance to a main problem statement. It extends the `BasePairwiseRankingsProcessor` class and utilizes a chat model to analyze and compare sub-problems.

## Properties

| Name              | Type   | Description               |
|-------------------|--------|---------------------------|
| subProblemIndex   | number | Index of the current sub-problem being processed. |

## Methods

| Name              | Parameters                                  | Return Type                        | Description                                                                 |
|-------------------|---------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair  | subProblemIndex: number, promptPair: number[] | Promise<IEnginePairWiseVoteResults> | Analyzes a pair of sub-problems and determines which one is more relevant.  |
| process           | -                                           | Promise<void>                      | Processes the ranking of sub-problems and updates the memory accordingly.   |

## Examples

```typescript
// Example usage of the RankSubProblemsProcessor class
const rankSubProblemsProcessor = new RankSubProblemsProcessor();

// Example of voting on a prompt pair
const voteResults = await rankSubProblemsProcessor.voteOnPromptPair(0, [1, 2]);

// Example of processing the sub-problems
await rankSubProblemsProcessor.process();
```