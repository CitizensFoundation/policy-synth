# RankSubProblemsProcessor

This class extends `BasePairwiseRankingsProcessor` to implement the functionality for ranking sub-problems based on their relevance to a main problem statement.

## Properties

| Name             | Type   | Description               |
|------------------|--------|---------------------------|
| subProblemIndex  | number | Index of the current sub-problem being processed. |

## Methods

| Name             | Parameters                                      | Return Type                     | Description                                                                 |
|------------------|-------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair | subProblemIndex: number, promptPair: number[]   | Promise<IEnginePairWiseVoteResults> | Processes a pair of sub-problems and votes on which one is more relevant.  |
| process          |                                                 | Promise<void>                   | Orchestrates the process of ranking sub-problems based on their relevance. |

## Example

```typescript
// Example usage of RankSubProblemsProcessor
import { RankSubProblemsProcessor } from '@policysynth/agents/problems/ranking/rankSubProblems.js';

const rankSubProblemsProcessor = new RankSubProblemsProcessor();

// Assuming setup and initialization are done here
// Example method calls
await rankSubProblemsProcessor.process();
```