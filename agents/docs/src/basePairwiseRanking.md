# BasePairwiseRankingsProcessor

This abstract class extends `BaseProlemSolvingAgent` to process pairwise rankings. It is designed to shuffle items, set up ranking prompts, and perform pairwise ranking based on the Elo rating system. It also provides functionality to get an ordered list of items based on their Elo ratings.

## Properties

| Name                      | Type                                      | Description                                                                 |
|---------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| prompts                   | Record<number, number[][]>                | Stores the prompts for comparison.                                          |
| allItems                  | Record<number, IEngineItem[] \| undefined>| Stores all items to be ranked, where `IEngineItem` is a placeholder for various item types. |
| INITIAL_ELO_RATING        | number                                    | The initial Elo rating for items.                                           |
| K_FACTOR_INITIAL          | number                                    | The initial K-factor in the Elo rating system.                              |
| K_FACTOR_MIN              | number                                    | The minimum K-factor in the Elo rating system.                              |
| NUM_COMPARISONS_FOR_MIN_K | number                                    | The number of comparisons for the K-factor to reach its minimum.            |
| maxNumberOfPrompts        | number                                    | The maximum number of prompts to be used for ranking.                       |
| numComparisons            | Record<number, Record<number, number>>    | Stores the number of comparisons made for each item.                        |
| KFactors                  | Record<number, Record<number, number>>    | Stores the K-factors for each item.                                         |
| eloRatings                | Record<number, Record<number, number>>    | Stores the Elo ratings for each item.                                       |
| progressFunction          | Function \| undefined                     | An optional function to report progress.                                    |

## Methods

| Name                    | Parameters                                                                 | Return Type                             | Description                                                                                   |
|-------------------------|----------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| fisherYatesShuffle      | array: any[]                                                               | any[]                                   | Shuffles the given array using the Fisher-Yates algorithm.                                    |
| setupRankingPrompts     | subProblemIndex: number, allItems: IEngineItem[], maxPrompts?: number, updateFunction?: Function | void                                    | Sets up the ranking prompts for a given sub-problem.                                          |
| voteOnPromptPair        | subProblemIndex: number, promptPair: number[], additionalData?: any        | Promise<IEnginePairWiseVoteResults>     | Abstract method to be implemented by subclasses for voting on a prompt pair.                  |
| getResultsFromLLM       | subProblemIndex: number, stageName: PsMemoryStageTypes, modelConstant: IEngineBaseAIModelConstants, messages: (HumanMessage \| SystemMessage)[], itemOneIndex: number, itemTwoIndex: number | Promise<{subProblemIndex: number, wonItemIndex: number, lostItemIndex: number}> | Gets results from a language model for a given prompt pair.                                   |
| getUpdatedKFactor       | numComparisons: number                                                     | number                                  | Calculates the updated K-factor based on the number of comparisons.                           |
| performPairwiseRanking  | subProblemIndex: number, additionalData?: any                              | Promise<void>                           | Performs pairwise ranking for a given sub-problem.                                            |
| getOrderedListOfItems   | subProblemIndex: number, returnEloRatings: boolean = false                 | any[]                                   | Returns an ordered list of items based on their Elo ratings, optionally including the ratings.|

## Example

```typescript
import { BasePairwiseRankingsProcessor } from '@policysynth/agents/basePairwiseRanking.js';

class CustomRankingsProcessor extends BasePairwiseRankingsProcessor {
  async voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<IEnginePairWiseVoteResults> {
    // Implementation for voting on a prompt pair
  }
}

// Example usage
const processor = new CustomRankingsProcessor();
processor.setupRankingPrompts(0, allItems);
processor.performPairwiseRanking(0).then(() => {
  const orderedItems = processor.getOrderedListOfItems(0);
  console.log(orderedItems);
});
```