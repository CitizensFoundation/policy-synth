# RankSolutionsProcessor

This class extends `BasePairwiseRankingsProcessor` to rank solution components for sub-problems using pairwise comparison.

## Properties

No public properties are documented.

## Methods

| Name                | Parameters                  | Return Type                        | Description                                                                 |
|---------------------|-----------------------------|------------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair    | subProblemIndex: number, promptPair: number[] | Promise<PsPairWiseVoteResults> | Processes a pair of prompts and returns the voting results.                 |
| processSubProblem   | subProblemIndex: number     | Promise<void>                      | Processes a single sub-problem by setting up and performing pairwise ranking. |
| process             | -                           | Promise<void>                      | Processes all sub-problems to rank solution components.                     |

## Example

```typescript
import { RankSolutionsProcessor } from '@policysynth/agents/solutions/ranking/rankSolutions.js';

const rankProcessor = new RankSolutionsProcessor();

// Example usage to process all sub-problems
rankProcessor.process().then(() => {
  console.log('Ranking of solution components completed.');
}).catch(error => {
  console.error('Error during ranking process:', error);
});
```