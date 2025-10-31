# PairwiseRankingAgent

An abstract base class for agents that perform pairwise ranking using the Elo algorithm, typically with LLMs (Large Language Models) to decide the winner between pairs. This class manages the setup, execution, and Elo rating updates for ranking a set of items by repeatedly comparing pairs.

Inherits from: [`PolicySynthAgent`](./agent.js)

## Properties

| Name                       | Type                                              | Description                                                                                  |
|----------------------------|---------------------------------------------------|----------------------------------------------------------------------------------------------|
| maxModelTokensOut          | `number` (getter)                                 | Maximum number of tokens to output from the model (default: 3000).                           |
| modelTemperature           | `number` (getter)                                 | Temperature for the model (default: 0.0, deterministic).                                     |
| defaultModelSize           | `PsAiModelSize`                                   | Default model size (default: `PsAiModelSize.Medium`).                                        |
| defaultModelType           | `PsAiModelType`                                   | Default model type (default: `PsAiModelType.Text`).                                          |
| prompts                    | `Record<number, number[][]>`                      | Stores the list of prompt pairs for each sub-problem index.                                  |
| allItems                   | `Record<number, (PsEloRateable[] \| string[])?>`  | Stores all items to be ranked for each sub-problem index.                                    |
| INITIAL_ELO_RATING         | `number`                                          | Initial Elo rating for each item (default: 1000).                                            |
| K_FACTOR_INITIAL           | `number`                                          | Initial K-factor for Elo updates (default: 60).                                              |
| K_FACTOR_MIN               | `number`                                          | Minimum K-factor for Elo updates (default: 10).                                              |
| NUM_COMPARISONS_FOR_MIN_K  | `number`                                          | Number of comparisons to reach minimum K-factor (default: 20).                               |
| maxNumberOfPrompts         | `number`                                          | Maximum number of pairwise prompts (default: 750 or from env).                               |
| maxParallellRanking        | `number`                                          | Maximum number of concurrent pairwise ranking tasks (default: 1).                            |
| disableStatusUpdates       | `boolean`                                         | If true, disables status/progress updates.                                                   |
| numComparisons             | `Record<number, Record<number, number>>`          | Tracks the number of comparisons for each item per sub-problem.                              |
| KFactors                   | `Record<number, Record<number, number>>`          | Tracks the current K-factor for each item per sub-problem.                                   |
| eloRatings                 | `Record<number, Record<number, number>>`          | Tracks the current Elo rating for each item per sub-problem.                                 |
| progressFunction           | `Function \| undefined`                           | Optional function for progress updates.                                                      |
| updatePrefix               | `string`                                          | Prefix for progress update messages (default: "Pairwise Ranking").                           |
| disableRelativeProgress    | `boolean`                                         | If true, disables relative progress calculation.                                             |

## Methods

| Name                        | Parameters                                                                                                                                                                                                                       | Return Type                        | Description                                                                                                    |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|----------------------------------------------------------------------------------------------------------------|
| fisherYatesShuffle          | `array: any[]`                                                                                                                                                                                                                   | `any[]`                            | Shuffles an array in place using the Fisher-Yates algorithm.                                                   |
| setupRankingPrompts         | `subProblemIndex: number, allItems: PsEloRateable[] \| string[], maxPrompts?: number, updateFunction?: Function, maxParallellRanking?: number, disableStatusUpdates?: boolean`              | `void`                             | Prepares the list of pairwise prompts and initializes Elo/K-factor tracking for a sub-problem.                 |
| voteOnPromptPair (abstract) | `subProblemIndex: number, promptPair: number[], additionalData?: any`                                                                                                                     | `Promise<PsPairWiseVoteResults>`    | Abstract method. Must be implemented by subclasses to decide the winner between a pair.                        |
| getResultsFromLLM           | `subProblemIndex: number, messages: any[], itemOneIndex: number, itemTwoIndex: number, modelOptions?: PsCallModelOptions`                                                                 | `Promise<PsPairWiseVoteResults>`    | Example helper to call the LLM and interpret the response for a pairwise prompt.                               |
| getUpdatedKFactor           | `numComparisons: number`                                                                                                                                                                  | `number`                            | Returns the updated K-factor based on the number of comparisons.                                               |
| performPairwiseRanking      | `subProblemIndex: number, additionalData?: any`                                                                                                                                           | `Promise<void>`                     | Executes the pairwise ranking process for a sub-problem, using concurrency-limited parallel calls.             |
| getOrderedListOfItems       | `subProblemIndex: number, setEloRatings?: boolean, customEloRatingKey?: string`                                                                                                           | `any[]`                             | Returns the list of items ordered by Elo rating, optionally setting the rating on each item.                   |
| updateElo (private)         | `subProblemIndex: number, wonItemIndex: number, lostItemIndex: number`                                                                                                                    | `void`                              | Updates the Elo ratings and K-factors for a winner/loser pair. (Private helper.)                               |

## Example

```typescript
import { PairwiseRankingAgent } from '@policysynth/agents/base/agentPairwiseRanking.js';

class MyCustomRankingAgent extends PairwiseRankingAgent {
  // Implement the abstract method to decide the winner between two items
  async voteOnPromptPair(subProblemIndex, promptPair, additionalData) {
    // Example: always pick the first item as the winner (for demo)
    return {
      subProblemIndex,
      wonItemIndex: promptPair[0],
      lostItemIndex: promptPair[1]
    };
  }
}

// Usage
const agent = new MyCustomRankingAgent();
const items = [
  { title: "Option A" },
  { title: "Option B" },
  { title: "Option C" }
];

agent.setupRankingPrompts(0, items);
await agent.performPairwiseRanking(0);

const ordered = agent.getOrderedListOfItems(0, true);
console.log("Ranked items:", ordered);
```

---

**Note:**  
- Subclasses must implement `voteOnPromptPair` to provide the logic for deciding the winner between two items (e.g., by calling an LLM).
- The class manages Elo ratings, K-factor scheduling, and concurrency for efficient and stable pairwise ranking.
- Progress and status updates can be customized or disabled as needed.