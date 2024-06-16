# RankEntitiesProcessor

This class extends `BasePairwiseRankingsProcessor` to implement a specific ranking process for entities affected by sub-problems in a complex problem statement. It uses a chat model to rank entities based on their impact.

## Properties

| Name   | Type   | Description               |
|--------|--------|---------------------------|
| chat   | ChatOpenAI | Instance of ChatOpenAI used for communication with the language model. |

## Methods

| Name              | Parameters                                    | Return Type                     | Description |
|-------------------|-----------------------------------------------|---------------------------------|-------------|
| voteOnPromptPair  | subProblemIndex: number, promptPair: number[] | Promise<PsPairWiseVoteResults> | Processes a pair of prompts and uses a language model to determine which entity is more affected. |
| process           | -                                             | Promise<void>                   | Processes all sub-problems and ranks entities based on their impact using pairwise comparison. |

## Example

```typescript
// Example usage of RankEntitiesProcessor
import { RankEntitiesProcessor } from '@policysynth/agents/problems/ranking/rankEntities.js';

const processor = new RankEntitiesProcessor();

// Example method calls
processor.process().then(() => {
  console.log("Ranking process completed.");
});
```