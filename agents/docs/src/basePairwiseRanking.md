# BasePairwiseRankingsProcessor

This class is an abstract extension of `BaseProblemSolvingAgent` designed for processing pairwise rankings of items. It manages the setup and execution of ranking prompts, shuffling of items, and calculation of Elo ratings based on pairwise comparisons.

## Properties

| Name                      | Type                                                                 | Description                                                                                   |
|---------------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| prompts                   | Record<number, number[][]>                                           | Stores the prompts for comparisons.                                                           |
| allItems                  | Record<number, IEngineItemTypes[] \| undefined>                     | Stores all items to be ranked, categorized by sub-problem index.                              |
| INITIAL_ELO_RATING        | number                                                               | The initial Elo rating for all items.                                                         |
| K_FACTOR_INITIAL          | number                                                               | The initial K-factor value used in Elo rating calculations.                                   |
| K_FACTOR_MIN              | number                                                               | The minimum K-factor value used in Elo rating calculations.                                   |
| NUM_COMPARISONS_FOR_MIN_K | number                                                               | The number of comparisons after which the K-factor reaches its minimum value.                 |
| maxNumberOfPrompts        | number                                                               | The maximum number of prompts to be generated for pairwise ranking.                           |
| numComparisons            | Record<number, Record<number, number>>                               | Tracks the number of comparisons made for each item, by sub-problem index and item index.    |
| KFactors                  | Record<number, Record<number, number>>                               | Stores the K-factor for each item, used in Elo rating calculations.                           |
| eloRatings                | Record<number, Record<number, number>>                               | Stores the current Elo ratings for each item, by sub-problem index and item index.            |
| progressFunction          | Function \| undefined                                                | An optional function to report progress during the ranking process.                          |

## Methods

| Name                      | Parameters                                                                                      | Return Type                                      | Description                                                                                   |
|---------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------------------------|
| fisherYatesShuffle        | array: any[]                                                                                    | any[]                                            | Shuffles the given array using the Fisher-Yates algorithm.                                    |
| setupRankingPrompts       | subProblemIndex: number, allItems: IEngineItemTypes[], maxPrompts?: number, updateFunction?: Function | void                                             | Sets up the ranking prompts for a given sub-problem, shuffling items and initializing ratings.|
| voteOnPromptPair          | subProblemIndex: number, promptPair: number[], additionalData?: any                            | Promise<IEnginePairWiseVoteResults>              | Abstract method to be implemented by subclasses for voting on a prompt pair.                  |
| getResultsFromLLM         | subProblemIndex: number, stageName: IEngineStageTypes, modelConstant: IEngineBaseAIModelConstants, messages: (HumanMessage \| SystemMessage)[], itemOneIndex: number, itemTwoIndex: number | Promise<{subProblemIndex: number, wonItemIndex: number, lostItemIndex: number}> | Retrieves results from a language model for a given prompt pair.                              |
| getUpdatedKFactor         | numComparisons: number                                                                           | number                                            | Calculates the updated K-factor based on the number of comparisons made.                      |
| performPairwiseRanking    | subProblemIndex: number, additionalData?: any                                                   | Promise<void>                                    | Performs the pairwise ranking process for a given sub-problem.                                |
| getOrderedListOfItems     | subProblemIndex: number, returnEloRatings: boolean = false                                      | any[]                                            | Returns the list of items ordered by their Elo ratings.                                       |

## Example

```typescript
// Example usage of BasePairwiseRankingsProcessor
import { BasePairwiseRankingsProcessor } from '@policysynth/agents/basePairwiseRanking.ts';

class CustomRankingsProcessor extends BasePairwiseRankingsProcessor {
  async voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<IEnginePairWiseVoteResults> {
    // Implementation of voting logic
  }
}

const processor = new CustomRankingsProcessor();
processor.setupRankingPrompts(0, items);
// Further usage of processor to perform rankings and get ordered list of items
```