# BasePairwiseRankingsProcessor

The `BasePairwiseRankingsProcessor` class is an abstract class that extends the `BaseProlemSolvingAgent` class. It is designed to handle the ranking of items using the Elo rating system in a pairwise comparison manner.

## Properties

| Name                      | Type   | Description                                                                 |
|---------------------------|--------|-----------------------------------------------------------------------------|
| prompts                   | Record<number, number[][]> | A record of prompts for pairwise comparisons, indexed by sub-problem.       |
| allItems                  | Record<number, any[] \| undefined> | A record of all items to be ranked, indexed by sub-problem.                 |
| INITIAL_ELO_RATING        | number | The initial Elo rating for items.                                           |
| K_FACTOR_INITIAL          | number | The initial K-factor in the Elo rating system.                              |
| K_FACTOR_MIN              | number | The minimum K-factor in the Elo rating system.                              |
| NUM_COMPARISONS_FOR_MIN_K | number | The number of comparisons needed for the K-factor to reach its minimum.     |
| maxNumberOfPrompts        | number | The maximum number of prompts for pairwise ranking.                         |
| numComparisons            | Record<number, Record<number, number>> | A record of the number of comparisons made for each item, indexed by sub-problem and item index. |
| KFactors                  | Record<number, Record<number, number>> | A record of K-factors for each item, indexed by sub-problem and item index. |
| eloRatings                | Record<number, Record<number, number>> | A record of Elo ratings for each item, indexed by sub-problem and item index. |
| progressFunction          | Function \| undefined | An optional function to report progress.                                    |

## Methods

| Name                   | Parameters                                      | Return Type | Description                                                                                   |
|------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| fisherYatesShuffle     | array: any[]                                    | any[]       | Shuffles an array using the Fisher-Yates algorithm.                                            |
| setupRankingPrompts    | subProblemIndex: number, allItems: any[], maxPrompts: number \| undefined, updateFunction: Function \| undefined | void        | Sets up the ranking prompts for a given sub-problem.                                          |
| voteOnPromptPair       | subProblemIndex: number, promptPair: number[], additionalData?: any | Promise<IEnginePairWiseVoteResults> | Abstract method to be implemented by subclasses to handle voting on a pair of prompts.       |
| getResultsFromLLM      | subProblemIndex: number, stageName: IEngineStageTypes, modelConstant: IEngineBaseAIModelConstants, messages: (HumanMessage \| SystemMessage)[], itemOneIndex: number, itemTwoIndex: number | Promise<any> | Retrieves results from a language model for a given pair of items.                            |
| getUpdatedKFactor      | numComparisons: number                          | number       | Calculates the updated K-factor based on the number of comparisons.                           |
| performPairwiseRanking | subProblemIndex: number, additionalData?: any   | Promise<void> | Performs the pairwise ranking process for a given sub-problem.                                |
| getOrderedListOfItems  | subProblemIndex: number, returnEloRatings: boolean | any[]       | Returns an ordered list of items based on their Elo ratings for a given sub-problem.          |

## Examples

```typescript
// Example usage of the BasePairwiseRankingsProcessor class
class CustomRankingsProcessor extends BasePairwiseRankingsProcessor {
  async voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<IEnginePairWiseVoteResults> {
    // Custom implementation for voting on a prompt pair
    // ...
  }
}

// Create an instance of the custom processor
const customProcessor = new CustomRankingsProcessor();

// Setup ranking prompts for a sub-problem
customProcessor.setupRankingPrompts(0, someItemsArray);

// Perform pairwise ranking
await customProcessor.performPairwiseRanking(0);

// Get the ordered list of items after ranking
const orderedItems = customProcessor.getOrderedListOfItems(0);
```

Note: Since `BasePairwiseRankingsProcessor` is an abstract class, it cannot be instantiated directly. It must be extended by a subclass that implements the abstract methods such as `voteOnPromptPair`.