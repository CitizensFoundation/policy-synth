# RankSubProblemsProcessor

This class extends `BasePairwiseRankingsProcessor` to specifically handle the ranking of sub-problems related to a main problem statement using pairwise comparison.

## Properties

| Name             | Type   | Description               |
|------------------|--------|---------------------------|
| subProblemIndex  | number | Index of the current sub-problem being processed. |

## Methods

| Name             | Parameters                                             | Return Type                     | Description |
|------------------|--------------------------------------------------------|---------------------------------|-------------|
| voteOnPromptPair | subProblemIndex: number, promptPair: number[]          | Promise<PsPairWiseVoteResults> | Processes a pair of sub-problems and uses an AI model to determine which one is more relevant to the main problem. |
| process          | -                                                      | Promise<void>                   | Orchestrates the entire process of ranking sub-problems by setting up prompts, performing pairwise ranking, and updating the memory with the ranked list. |

## Example

```typescript
import { RankSubProblemsProcessor } from '@policysynth/agents/problems/ranking/rankSubProblems.js';

const processor = new RankSubProblemsProcessor();

// Example setup and usage
processor.setupRankingPrompts(-1, someSubProblemsArray, maxPrompts);
processor.performPairwiseRanking(-1).then(() => {
  console.log("Pairwise ranking completed.");
});

// To process and rank sub-problems
processor.process().then(() => {
  console.log("Sub-problems have been ranked and memory is updated.");
});
```