# PairwiseRankingAgent

An abstract base class for agents that perform pairwise ranking of items using Elo rating, typically with the help of a language model (LLM). This class manages the setup, execution, and Elo updating for pairwise comparisons, supporting concurrency-limited parallel execution and progress tracking.

Inherit from this class and implement the `voteOnPromptPair` method to define how a pairwise comparison is decided (e.g., by calling an LLM).

---

## Properties

| Name                       | Type                                                      | Description                                                                                      |
|----------------------------|-----------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| maxModelTokensOut          | `number` (getter)                                         | Maximum number of tokens to output from the model (default: 3000).                               |
| modelTemperature           | `number` (getter)                                         | Temperature for the model (default: 0.0).                                                        |
| defaultModelSize           | `PsAiModelSize`                                           | Default model size (default: `PsAiModelSize.Medium`).                                            |
| defaultModelType           | `PsAiModelType`                                           | Default model type (default: `PsAiModelType.Text`).                                              |
| prompts                    | `Record<number, number[][]>`                              | Stores the list of prompt pairs for each sub-problem.                                            |
| allItems                   | `Record<number, (PsEloRateable[] \| string[]) \| undefined>` | Stores all items to be ranked for each sub-problem.                                              |
| INITIAL_ELO_RATING         | `number`                                                  | Initial Elo rating for each item (default: 1000).                                                |
| K_FACTOR_INITIAL           | `number`                                                  | Initial K-factor for Elo updates (default: 60).                                                  |
| K_FACTOR_MIN               | `number`                                                  | Minimum K-factor for Elo updates (default: 10).                                                  |
| NUM_COMPARISONS_FOR_MIN_K  | `number`                                                  | Number of comparisons to reach minimum K-factor (default: 20).                                   |
| maxNumberOfPrompts         | `number`                                                  | Maximum number of pairwise prompts (default: 750 or from env).                                   |
| maxParallellRanking        | `number`                                                  | Maximum number of concurrent pairwise ranking tasks (default: 1).                                |
| disableStatusUpdates       | `boolean`                                                 | If true, disables status/progress updates.                                                       |
| numComparisons             | `Record<number, Record<number, number>>`                  | Tracks the number of comparisons for each item in each sub-problem.                              |
| KFactors                   | `Record<number, Record<number, number>>`                  | Tracks the K-factor for each item in each sub-problem.                                           |
| eloRatings                 | `Record<number, Record<number, number>>`                  | Tracks the Elo rating for each item in each sub-problem.                                         |
| progressFunction           | `Function \| undefined`                                   | Optional function for reporting progress.                                                        |
| updatePrefix               | `string`                                                  | Prefix for progress updates (default: "Pairwise Ranking").                                       |
| disableRelativeProgress    | `boolean`                                                 | If true, disables relative progress calculation.                                                 |

---

## Methods

| Name                        | Parameters                                                                                                                      | Return Type                        | Description                                                                                                 |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------|
| fisherYatesShuffle          | `array: any[]`                                                                                                                  | `any[]`                             | Shuffles the array in place using the Fisher-Yates algorithm.                                               |
| setupRankingPrompts         | `subProblemIndex: number, allItems: PsEloRateable[] \| string[], maxPrompts?: number, updateFunction?: Function, maxParallellRanking?: number, disableStatusUpdates?: boolean` | `void`                              | Prepares the pairwise prompt pairs and initializes Elo/K-factor/numComparisons for a sub-problem.           |
| voteOnPromptPair (abstract) | `subProblemIndex: number, promptPair: number[], additionalData?: any`                                                          | `Promise<PsPairWiseVoteResults>`    | **Abstract.** Must be implemented by subclass. Decides which item wins in a pairwise prompt.                |
| getResultsFromLLM           | `subProblemIndex: number, messages: any[], itemOneIndex: number, itemTwoIndex: number, modelOptions?: PsCallModelOptions`      | `Promise<PsPairWiseVoteResults>`    | Example helper to call the LLM and interpret the response for a pairwise prompt.                            |
| getUpdatedKFactor           | `numComparisons: number`                                                                                                        | `number`                            | Returns the updated K-factor based on the number of comparisons (linear schedule).                          |
| performPairwiseRanking      | `subProblemIndex: number, additionalData?: any`                                                                                 | `Promise<void>`                     | Runs all pairwise comparisons for a sub-problem, concurrency-limited, and applies Elo updates in order.     |
| getOrderedListOfItems       | `subProblemIndex: number, setEloRatings?: boolean, customEloRatingKey?: string`                                                 | `any[]`                             | Returns the items for a sub-problem, ordered by Elo rating (descending). Optionally sets Elo on each item.  |

---

## Example

```typescript
import { PairwiseRankingAgent } from '@policysynth/agents/base/agentPairwiseRanking.js';
import { PsPairWiseVoteResults } from '@policysynth/agents/base/agentPairwiseRanking.js';

// Example subclass implementing the abstract method
class MyPairwiseAgent extends PairwiseRankingAgent {
  async voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[],
    additionalData?: any
  ): Promise<PsPairWiseVoteResults> {
    // Custom logic or call to LLM
    // For demonstration, randomly pick a winner
    const [i, j] = promptPair;
    const winner = Math.random() > 0.5 ? i : j;
    const loser = winner === i ? j : i;
    return { subProblemIndex, wonItemIndex: winner, lostItemIndex: loser };
  }
}

// Usage
const agent = new MyPairwiseAgent();
const items = [{ title: "A" }, { title: "B" }, { title: "C" }];
agent.setupRankingPrompts(0, items);
await agent.performPairwiseRanking(0);
const ordered = agent.getOrderedListOfItems(0, true);
console.log(ordered);
```

---

## Notes

- **Subclassing:** You must implement `voteOnPromptPair` in your subclass. This is where you call your LLM or other logic to decide the winner of a pair.
- **Elo System:** Elo ratings are updated after each comparison, with K-factor decreasing as more comparisons are made.
- **Concurrency:** Pairwise comparisons are run in parallel, but limited by `maxParallellRanking`.
- **Progress:** Progress can be tracked via `progressFunction` or status updates.
- **Prompt Reduction:** If the number of possible pairs exceeds `maxNumberOfPrompts`, a random subset is selected.

---

## Types Used

- `PsEloRateable`: An interface for items that can be Elo-rated (should have an `eloRating` property).
- `PsPairWiseVoteResults`: `{ subProblemIndex: number, wonItemIndex: number, lostItemIndex: number }`
- `PsCallModelOptions`: Options for calling the LLM (see project type definitions).

---

This class is designed for robust, scalable, and reproducible pairwise ranking workflows, especially when using LLMs for subjective or complex comparisons.