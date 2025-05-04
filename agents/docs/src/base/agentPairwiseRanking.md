# PairwiseRankingAgent

An abstract base class for implementing pairwise ranking agents using Elo rating, designed for use with large language models (LLMs) or other decision logic. This agent manages the process of ranking a set of items by repeatedly comparing pairs, updating Elo ratings, and supporting concurrency-limited parallel execution.

## Properties

| Name                        | Type                                         | Description                                                                                      |
|-----------------------------|----------------------------------------------|--------------------------------------------------------------------------------------------------|
| maxModelTokensOut           | `number` (getter)                            | Maximum number of output tokens for the model (default: 3000).                                   |
| modelTemperature            | `number` (getter)                            | Temperature for the model (default: 0.0).                                                        |
| defaultModelSize            | `PsAiModelSize`                              | Default model size (default: `PsAiModelSize.Medium`).                                            |
| defaultModelType            | `PsAiModelType`                              | Default model type (default: `PsAiModelType.Text`).                                              |
| prompts                     | `Record<number, number[][]>`                 | Stores the list of prompt pairs for each sub-problem index.                                      |
| allItems                    | `Record<number, (PsEloRateable[] \| string[]) \| undefined>` | Stores all items to be ranked for each sub-problem index.                                        |
| INITIAL_ELO_RATING          | `number`                                     | Initial Elo rating for all items (default: 1000).                                                |
| K_FACTOR_INITIAL            | `number`                                     | Initial K-factor for Elo updates (default: 60).                                                  |
| K_FACTOR_MIN                | `number`                                     | Minimum K-factor for Elo updates (default: 10).                                                  |
| NUM_COMPARISONS_FOR_MIN_K   | `number`                                     | Number of comparisons to reach minimum K-factor (default: 20).                                   |
| maxNumberOfPrompts          | `number`                                     | Maximum number of pairwise prompts (default: 750 or from env).                                   |
| maxParallellRanking         | `number`                                     | Maximum number of concurrent pairwise ranking tasks (default: 1).                                |
| numComparisons              | `Record<number, Record<number, number>>`     | Tracks the number of comparisons for each item in each sub-problem.                              |
| KFactors                    | `Record<number, Record<number, number>>`     | Tracks the current K-factor for each item in each sub-problem.                                   |
| eloRatings                  | `Record<number, Record<number, number>>`     | Tracks the current Elo rating for each item in each sub-problem.                                 |
| progressFunction            | `Function \| undefined`                      | Optional function for progress updates.                                                          |
| updatePrefix                | `string`                                     | Prefix for progress updates (default: "Pairwise Ranking").                                       |
| disableRelativeProgress     | `boolean`                                    | If true, disables relative progress reporting.                                                   |

## Methods

| Name                        | Parameters                                                                                                   | Return Type                        | Description                                                                                                 |
|-----------------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------|
| fisherYatesShuffle          | `array: any[]`                                                                                               | `any[]`                            | Shuffles an array in place using the Fisher-Yates algorithm.                                                |
| setupRankingPrompts         | `subProblemIndex: number, allItems: PsEloRateable[] \| string[], maxPrompts?: number, updateFunction?: Function, maxParallellRanking?: number` | `void`                             | Prepares the list of prompt pairs for pairwise ranking, shuffles items, and initializes Elo/K-factor state. |
| voteOnPromptPair (abstract) | `subProblemIndex: number, promptPair: number[], additionalData?: any`                                        | `Promise<PsPairWiseVoteResults>`   | Abstract method to decide which item wins a prompt pair. Must be implemented by subclasses.                 |
| getResultsFromLLM           | `subProblemIndex: number, messages: any[], itemOneIndex: number, itemTwoIndex: number, modelOptions?: PsCallModelOptions` | `Promise<PsPairWiseVoteResults>`   | Example helper to call the LLM and interpret the response for a prompt pair.                                |
| getUpdatedKFactor           | `numComparisons: number`                                                                                     | `number`                           | Calculates the K-factor for Elo updates based on the number of comparisons.                                 |
| performPairwiseRanking      | `subProblemIndex: number, additionalData?: any`                                                              | `Promise<void>`                    | Executes the pairwise ranking process with concurrency-limited parallelism and applies Elo updates.         |
| getOrderedListOfItems       | `subProblemIndex: number, setEloRatings?: boolean, customEloRatingKey?: string`                              | `any[]`                            | Returns the list of items ordered by Elo rating, optionally setting the rating on each item.                |

### Private Methods

| Name         | Parameters                                                      | Return Type | Description                                                                                 |
|--------------|-----------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------|
| updateElo    | `subProblemIndex: number, wonItemIndex: number, lostItemIndex: number` | `void`      | Updates the Elo ratings and K-factors for the winner and loser of a prompt pair.            |

## Example

```typescript
import { PairwiseRankingAgent } from '@policysynth/agents/base/agentPairwiseRanking.js';
import { PsPairWiseVoteResults, PsEloRateable } from '@policysynth/agents/base/agentTypes.js';

class MyCustomPairwiseAgent extends PairwiseRankingAgent {
  // Implement the abstract method
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
const agent = new MyCustomPairwiseAgent();
const items: PsEloRateable[] = [
  { title: "Item 1", originalPosition: 0, description: "", url: "", date: "" },
  { title: "Item 2", originalPosition: 1, description: "", url: "", date: "" },
  { title: "Item 3", originalPosition: 2, description: "", url: "", date: "" }
];
agent.setupRankingPrompts(0, items);
await agent.performPairwiseRanking(0);
const ordered = agent.getOrderedListOfItems(0, true);
console.log(ordered);
```

---

**Note:**  
- This class is abstract and must be subclassed with an implementation of `voteOnPromptPair`.
- Elo rating and K-factor logic is handled internally.
- Designed for use in AI/LLM-based ranking scenarios, but can be adapted for other pairwise comparison logic.