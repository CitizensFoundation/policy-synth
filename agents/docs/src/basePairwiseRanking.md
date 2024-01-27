# BasePairwiseRankingsProcessor

This abstract class extends `BaseProlemSolvingAgent` to process pairwise rankings of items. It shuffles items, sets up ranking prompts, and performs pairwise ranking to order items based on their Elo ratings.

## Properties

| Name                     | Type                                                                 | Description                                                                 |
|--------------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| prompts                  | Record<number, number[][]>                                           | Stores prompts for comparisons.                                             |
| allItems                 | Record<number, IEngineSearchResultItem[] \| IEngineSolution[] \| IEngineProblemStatement[] \| IEngineAffectedEntity[] \| IEngineProCon[] \| string[] \| undefined> | Stores all items to be ranked.                                              |
| INITIAL_ELO_RATING       | number                                                               | The initial Elo rating for items.                                           |
| K_FACTOR_INITIAL         | number                                                               | The initial K-factor for Elo rating calculations.                           |
| K_FACTOR_MIN             | number                                                               | The minimum K-factor for Elo rating calculations.                           |
| NUM_COMPARISONS_FOR_MIN_K| number                                                               | The number of comparisons for the K-factor to reach its minimum.            |
| maxNumberOfPrompts       | number                                                               | The maximum number of prompts for pairwise ranking.                         |
| numComparisons           | Record<number, Record<number, number>>                               | Tracks the number of comparisons for each item.                             |
| KFactors                 | Record<number, Record<number, number>>                               | Stores K-factors for each item.                                             |
| eloRatings               | Record<number, Record<number, number>>                               | Stores Elo ratings for each item.                                           |
| progressFunction         | Function \| undefined                                                | An optional function to report progress.                                    |

## Methods

| Name                     | Parameters                                                                                                                                                                                                 | Return Type                             | Description                                                                                   |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| fisherYatesShuffle       | array: any[]                                                                                                                                                                                                 | any[]                                   | Shuffles an array using the Fisher-Yates algorithm.                                           |
| setupRankingPrompts      | subProblemIndex: number, allItems: IEngineSearchResultItem[] \| IEngineSolution[] \| IEngineProblemStatement[] \| string[] \| IEngineProCon[] \| IEngineAffectedEntity[], maxPrompts: number \| undefined, updateFunction: Function \| undefined | void                                    | Sets up ranking prompts for a given sub-problem.                                              |
| voteOnPromptPair         | subProblemIndex: number, promptPair: number[], additionalData?: any                                                                                                                                          | Promise<IEnginePairWiseVoteResults>    | Abstract method to be implemented by subclasses for voting on a prompt pair.                 |
| getResultsFromLLM        | subProblemIndex: number, stageName: IEngineStageTypes, modelConstant: IEngineBaseAIModelConstants, messages: (HumanMessage \| SystemMessage)[], itemOneIndex: number, itemTwoIndex: number                   | Promise<{ subProblemIndex: number, wonItemIndex: number, lostItemIndex: number }> | Gets results from a language model for a given prompt pair.                                   |
| getUpdatedKFactor        | numComparisons: number                                                                                                                                                                                       | number                                  | Calculates the updated K-factor based on the number of comparisons.                           |
| performPairwiseRanking   | subProblemIndex: number, additionalData?: any                                                                                                                                                                | Promise<void>                           | Performs pairwise ranking for all items in a given sub-problem.                               |
| getOrderedListOfItems    | subProblemIndex: number, returnEloRatings: boolean = false                                                                                                                                                    | any[]                                   | Returns the ordered list of items based on Elo ratings, optionally including the ratings.    |

## Example

```
// Example usage of BasePairwiseRankingsProcessor
import { BasePairwiseRankingsProcessor } from '@policysynth/agents/basePairwiseRanking.js';

class CustomRankingsProcessor extends BasePairwiseRankingsProcessor {
  async voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<IEnginePairWiseVoteResults> {
    // Implementation for voting on a prompt pair
  }
}

const processor = new CustomRankingsProcessor();
processor.setupRankingPrompts(0, [...items], undefined, (progress) => console.log(progress));
```