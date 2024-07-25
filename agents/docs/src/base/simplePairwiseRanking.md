# SimplePairwiseRankingsAgent

The `SimplePairwiseRankingsAgent` is an abstract class that extends the `PolicySynthSimpleAgentBase`. It is designed to perform pairwise ranking of items using the Elo rating system. This class provides methods to set up ranking prompts, vote on prompt pairs, get results from a language model, and perform pairwise ranking.

## Properties

| Name                        | Type                                | Description                                                                 |
|-----------------------------|-------------------------------------|-----------------------------------------------------------------------------|
| `maxModelTokensOut`         | `number`                            | Maximum number of tokens for the model output.                              |
| `modelTemperature`          | `number`                            | Temperature setting for the model.                                          |
| `prompts`                   | `Record<number, number[][]>`        | Record of prompts for each sub-problem.                                     |
| `allItems`                  | `Record<number, (PsEloRateable[] \| string[]) \| undefined>` | Record of all items for each sub-problem.                                   |
| `INITIAL_ELO_RATING`        | `number`                            | Initial Elo rating for items.                                               |
| `K_FACTOR_INITIAL`          | `number`                            | Initial K-factor for Elo rating calculation.                                |
| `K_FACTOR_MIN`              | `number`                            | Minimum K-factor for Elo rating calculation.                                |
| `NUM_COMPARISONS_FOR_MIN_K` | `number`                            | Number of comparisons required for K-factor to reach its minimum.           |
| `maxNumberOfPrompts`        | `number`                            | Maximum number of prompts for pairwise ranking.                             |
| `numComparisons`            | `Record<number, Record<number, number>>` | Record of the number of comparisons for each item in each sub-problem.      |
| `KFactors`                  | `Record<number, Record<number, number>>` | Record of K-factors for each item in each sub-problem.                      |
| `eloRatings`                | `Record<number, Record<number, number>>` | Record of Elo ratings for each item in each sub-problem.                    |
| `progressFunction`          | `Function \| undefined`             | Function to update progress during ranking.                                 |

## Methods

| Name                    | Parameters                                                                 | Return Type                | Description                                                                 |
|-------------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| `fisherYatesShuffle`    | `array: any[]`                                                             | `any[]`                    | Shuffles an array using the Fisher-Yates algorithm.                         |
| `setupRankingPrompts`   | `subProblemIndex: number, allItems: PsEloRateable[] \| string[], maxPrompts: number \| undefined = undefined, updateFunction: Function \| undefined = undefined` | `void`                     | Sets up ranking prompts for a sub-problem.                                   |
| `abstract voteOnPromptPair` | `subProblemIndex: number, promptPair: number[], additionalData?: any` | `Promise<PsPairWiseVoteResults>` | Abstract method to vote on a prompt pair.                                   |
| `getResultsFromLLM`     | `subProblemIndex: number, stageName: string, messages: PsModelMessage[], itemOneIndex: number, itemTwoIndex: number` | `Promise<{ subProblemIndex: number, wonItemIndex: number, lostItemIndex: number }>` | Gets results from a language model for a prompt pair.                       |
| `getUpdatedKFactor`     | `numComparisons: number`                                                   | `number`                   | Calculates the updated K-factor based on the number of comparisons.         |
| `performPairwiseRanking`| `subProblemIndex: number, additionalData?: any`                            | `Promise<void>`            | Performs pairwise ranking for a sub-problem.                                |
| `getOrderedListOfItems` | `subProblemIndex: number, setEloRatings: boolean = false, customEloRatingKey: string \| undefined = undefined` | `any[]`                    | Gets an ordered list of items based on their Elo ratings.                   |

## Example

```typescript
import { SimplePairwiseRankingsAgent } from '@policysynth/agents/base/simplePairwiseRanking.js';

class MyPairwiseRankingAgent extends SimplePairwiseRankingsAgent {
  async voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<PsPairWiseVoteResults> {
    // Implement your voting logic here
    return { wonItemIndex: promptPair[0], lostItemIndex: promptPair[1] };
  }
}

const agent = new MyPairwiseRankingAgent();
agent.setupRankingPrompts(0, ["Item1", "Item2", "Item3"]);
agent.performPairwiseRanking(0).then(() => {
  const orderedItems = agent.getOrderedListOfItems(0);
  console.log(orderedItems);
});
```