# BasePairwiseRankingsProcessor

This abstract class extends `BaseProblemSolvingAgent` to process pairwise rankings, managing prompts, ELO ratings, and K-factors for items in a ranking problem.

## Properties

| Name                          | Type                                             | Description                                       |
|-------------------------------|--------------------------------------------------|---------------------------------------------------|
| prompts                       | Record<number, number[][]>                       | Stores the prompts for comparisons.               |
| allItems                      | Record<number, (PsEloRateable[] \| string[]) \| undefined> | Stores all items involved in the ranking.        |
| INITIAL_ELO_RATING            | number                                           | Initial ELO rating for each item.                 |
| K_FACTOR_INITIAL              | number                                           | Initial K-factor in ELO rating calculation.       |
| K_FACTOR_MIN                  | number                                           | Minimum K-factor in ELO rating calculation.       |
| NUM_COMPARISONS_FOR_MIN_K     | number                                           | Number of comparisons to reach minimum K-factor.  |
| maxNumberOfPrompts            | number                                           | Maximum number of prompts for comparisons.        |
| numComparisons                | Record<number, Record<number, number>>           | Tracks the number of comparisons per item.        |
| KFactors                      | Record<number, Record<number, number>>           | Current K-factor for each item.                   |
| eloRatings                    | Record<number, Record<number, number>>           | Current ELO ratings for each item.                |
| progressFunction              | Function \| undefined                            | Optional function to report progress.             |

## Methods

| Name                    | Parameters                                                                 | Return Type                             | Description                                                                 |
|-------------------------|----------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------|
| fisherYatesShuffle      | array: any[]                                                               | any[]                                   | Shuffles an array using the Fisher-Yates algorithm.                         |
| setupRankingPrompts     | subProblemIndex: number, allItems: PsEloRateable[] \| string[], maxPrompts: number \| undefined, updateFunction: Function \| undefined | void                                    | Sets up the ranking prompts for a given sub-problem.                        |
| voteOnPromptPair        | subProblemIndex: number, promptPair: number[], additionalData?: any        | Promise<IEnginePairWiseVoteResults>     | Abstract method to process a vote on a prompt pair.                         |
| getResultsFromLLM       | subProblemIndex: number, stageName: PsMemoryStageTypes, modelConstant: IEngineBaseAIModelConstants, messages: (HumanMessage \| SystemMessage)[], itemOneIndex: number, itemTwoIndex: number | Promise<{ subProblemIndex: number, wonItemIndex: number, lostItemIndex: number }> | Gets results from a language model for a given prompt pair.                 |
| getUpdatedKFactor       | numComparisons: number                                                      | number                                  | Calculates the updated K-factor based on the number of comparisons.         |
| performPairwiseRanking  | subProblemIndex: number, additionalData?: any                               | Promise<void>                           | Performs the pairwise ranking process for a given sub-problem.              |
| getOrderedListOfItems   | subProblemIndex: number, setEloRatings: boolean, customEloRatingKey: string \| undefined | any[]                                   | Returns the ordered list of items based on their ELO ratings.               |

## Example

```typescript
import { BasePairwiseRankingsProcessor } from '@policysynth/agents/basePairwiseRanking.js';

class CustomRankingsProcessor extends BasePairwiseRankingsProcessor {
  async voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<IEnginePairWiseVoteResults> {
    // Implementation specific logic to vote on a prompt pair
    return { subProblemIndex, wonItemIndex: promptPair[0], lostItemIndex: promptPair[1] };
  }
}

// Example usage
const processor = new CustomRankingsProcessor();
processor.setupRankingPrompts(0, ["Item1", "Item2"], 10);
```
