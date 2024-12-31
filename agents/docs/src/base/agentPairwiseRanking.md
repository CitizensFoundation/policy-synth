# PairwiseRankingAgent

The `PairwiseRankingAgent` is an abstract class that extends the `PolicySynthAgent`. It is designed to perform pairwise ranking of items using Elo rating system. The class provides methods to set up ranking prompts, perform pairwise ranking, and retrieve ordered lists of items based on their Elo ratings.

## Properties

| Name                      | Type                                      | Description                                                                 |
|---------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| `maxModelTokensOut`       | `number`                                  | Maximum number of tokens output by the model.                               |
| `modelTemperature`        | `number`                                  | Temperature setting for the model.                                          |
| `defaultModelSize`        | `PsAiModelSize`                           | Default size of the AI model.                                               |
| `prompts`                 | `Record<number, number[][]>`              | Stores the prompts for each sub-problem index.                              |
| `allItems`                | `Record<number, (PsEloRateable[] \| string[]) \| undefined>` | Stores all items for each sub-problem index.                                |
| `INITIAL_ELO_RATING`      | `number`                                  | Initial Elo rating for items.                                               |
| `K_FACTOR_INITIAL`        | `number`                                  | Initial K-factor for Elo rating calculation.                                |
| `K_FACTOR_MIN`            | `number`                                  | Minimum K-factor for Elo rating calculation.                                |
| `NUM_COMPARISONS_FOR_MIN_K` | `number`                                | Number of comparisons required for K-factor to reach its minimum.           |
| `maxNumberOfPrompts`      | `number`                                  | Maximum number of prompts for pairwise ranking.                             |
| `maxParallellRanking`     | `number`                                  | Maximum number of parallel rankings.                                        |
| `numComparisons`          | `Record<number, Record<number, number>>`  | Stores the number of comparisons for each item in each sub-problem.         |
| `KFactors`                | `Record<number, Record<number, number>>`  | Stores the K-factors for each item in each sub-problem.                     |
| `eloRatings`              | `Record<number, Record<number, number>>`  | Stores the Elo ratings for each item in each sub-problem.                   |
| `progressFunction`        | `Function \| undefined`                   | Function to update progress.                                                |
| `updatePrefix`            | `string`                                  | Prefix for update messages.                                                 |
| `disableRelativeProgress` | `boolean`                                 | Flag to disable relative progress updates.                                  |

## Methods

| Name                      | Parameters                                                                 | Return Type                | Description                                                                 |
|---------------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| `fisherYatesShuffle`      | `array: any[]`                                                             | `any[]`                    | Shuffles an array using the Fisher-Yates algorithm.                         |
| `setupRankingPrompts`     | `subProblemIndex: number, allItems: PsEloRateable[] \| string[], maxPrompts?: number, updateFunction?: Function, maxParallellRanking: number` | `void`                     | Sets up ranking prompts for a sub-problem.                                  |
| `voteOnPromptPair`        | `subProblemIndex: number, promptPair: number[], additionalData?: any`      | `Promise<PsPairWiseVoteResults>` | Abstract method to vote on a pair of prompts.                               |
| `getResultsFromLLM`       | `subProblemIndex: number, messages: PsModelMessage[], itemOneIndex: number, itemTwoIndex: number` | `Promise<{ subProblemIndex: number, wonItemIndex: number, lostItemIndex: number }>` | Gets results from the language model for a pair of items.                   |
| `getUpdatedKFactor`       | `numComparisons: number`                                                   | `number`                   | Calculates the updated K-factor based on the number of comparisons.         |
| `performPairwiseRanking`  | `subProblemIndex: number, additionalData?: any`                            | `Promise<void>`            | Performs pairwise ranking for a sub-problem.                                |
| `getOrderedListOfItems`   | `subProblemIndex: number, setEloRatings: boolean, customEloRatingKey?: string` | `any[]`                    | Retrieves an ordered list of items based on their Elo ratings.              |

## Example

```typescript
import { PairwiseRankingAgent } from '@policysynth/agents/base/agentPairwiseRanking.js';

class CustomRankingAgent extends PairwiseRankingAgent {
  async voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<PsPairWiseVoteResults> {
    // Implement custom logic to vote on a pair of prompts
    return { wonItemIndex: 0, lostItemIndex: 1 };
  }
}

const agent = new CustomRankingAgent();
agent.setupRankingPrompts(0, [{ eloRating: 1000 }, { eloRating: 1000 }]);
agent.performPairwiseRanking(0).then(() => {
  const orderedItems = agent.getOrderedListOfItems(0);
  console.log(orderedItems);
});
```