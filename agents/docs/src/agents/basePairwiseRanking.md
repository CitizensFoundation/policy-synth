# BasePairwiseRankingsProcessor

Abstract class that extends `BaseProcessor` to handle pairwise ranking of items using the Elo rating system.

## Properties

| Name                     | Type   | Description                                                                 |
|--------------------------|--------|-----------------------------------------------------------------------------|
| prompts                  | Record<number, number[][]> | Stores the indices of item pairs for each sub-problem to be compared.       |
| allItems                 | Record<number, (IEngineSearchResultItem[] \| IEngineSolution[] \| IEngineProblemStatement[] \| IEngineAffectedEntity[] \| IEngineProCon[] \| string[]) \| undefined> | Stores all items to be ranked for each sub-problem.                         |
| INITIAL_ELO_RATING       | number | The initial Elo rating for each item.                                       |
| K_FACTOR_INITIAL         | number | The initial K-factor used in Elo rating calculations.                       |
| K_FACTOR_MIN             | number | The minimum K-factor used in Elo rating calculations.                       |
| NUM_COMPARISONS_FOR_MIN_K| number | The number of comparisons after which the K-factor reaches its minimum.     |
| maxNumberOfPrompts       | number | The maximum number of prompts to be used for pairwise comparisons.          |
| numComparisons           | Record<number, Record<number, number>> | Records the number of comparisons made for each item in each sub-problem.   |
| KFactors                 | Record<number, Record<number, number>> | Stores the K-factors for each item in each sub-problem.                     |
| eloRatings               | Record<number, Record<number, number>> | Stores the Elo ratings for each item in each sub-problem.                   |

## Methods

| Name                     | Parameters                                      | Return Type | Description                                                                 |
|--------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| fisherYatesShuffle       | array: any[]                                    | any[]       | Shuffles an array using the Fisher-Yates algorithm.                         |
| setupRankingPrompts      | subProblemIndex: number, allItems: (IEngineSearchResultItem[] \| IEngineSolution[] \| IEngineProblemStatement[] \| string[] \| IEngineProCon[] \| IEngineAffectedEntity[]), maxPrompts: number \| undefined | void        | Sets up the ranking prompts for a given sub-problem.                        |
| voteOnPromptPair         | subProblemIndex: number, promptPair: number[], additionalData?: any | Promise<IEnginePairWiseVoteResults> | Abstract method to be implemented for voting on a pair of prompts.          |
| getResultsFromLLM        | subProblemIndex: number, stageName: IEngineStageTypes, modelConstant: IEngineBaseAIModelConstants, messages: (HumanMessage \| SystemMessage)[], itemOneIndex: number, itemTwoIndex: number | Promise<{ subProblemIndex: number, wonItemIndex: number, lostItemIndex: number }> | Gets results from a language model to determine the winning item.           |
| getUpdatedKFactor        | numComparisons: number                           | number      | Calculates the updated K-factor based on the number of comparisons.         |
| performPairwiseRanking   | subProblemIndex: number, additionalData?: any   | Promise<void> | Performs the pairwise ranking process for a given sub-problem.              |
| getOrderedListOfItems    | subProblemIndex: number, returnEloRatings: boolean | any[]       | Returns an ordered list of items based on their Elo ratings.                |
| process                  | -                                                | Promise<void> | Processes the pairwise ranking. Overrides the `process` method from `BaseProcessor`. |

## Examples

```typescript
// Example usage of the BasePairwiseRankingsProcessor
abstract class CustomRankingsProcessor extends BasePairwiseRankingsProcessor {
  // Implement abstract methods and any additional logic
}
```