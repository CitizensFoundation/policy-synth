# SearchQueriesRanker

A specialized agent for ranking web search queries based on their relevance to a given research question. Inherits from `SimplePairwiseRankingsAgent` and uses pairwise comparison via an LLM to determine the most relevant queries.

## Properties

| Name             | Type                              | Description                                                      |
|------------------|-----------------------------------|------------------------------------------------------------------|
| searchQuestion   | `string \| undefined`             | The research question to which search queries are being ranked.  |
| progressFunction | `Function \| undefined` (inherited) | Optional function to report progress during ranking.             |
| allItems         | `any` (inherited)                 | Internal storage for items to be ranked.                         |

## Methods

| Name                | Parameters                                                                 | Return Type                  | Description                                                                                                    |
|---------------------|----------------------------------------------------------------------------|------------------------------|----------------------------------------------------------------------------------------------------------------|
| constructor         | `memory: PsSimpleAgentMemoryData, progressFunction?: Function`             | `SearchQueriesRanker`        | Initializes the agent with memory and an optional progress callback.                                           |
| voteOnPromptPair    | `index: number, promptPair: number[]`                                      | `Promise<PsPairWiseVoteResults>` | Compares two search queries for a given research question and returns the LLM's ranking decision.              |
| rankSearchQueries   | `queriesToRank: string[], searchQuestion: string, maxPrompts?: number`     | `Promise<string[]>`          | Ranks an array of search queries for a research question and returns them in order of relevance.               |
| createSystemMessage | `content: string` (inherited)                                              | `PsModelMessage`             | Creates a system message for the LLM.                                                                          |
| createHumanMessage  | `content: string` (inherited)                                              | `PsModelMessage`             | Creates a human message for the LLM.                                                                           |
| getResultsFromLLM   | `index: number, task: string, messages: PsModelMessage[], itemOneIndex: number, itemTwoIndex: number` (inherited) | `Promise<PsPairWiseVoteResults>` | Sends messages to the LLM and parses the result for pairwise ranking.                                          |
| setupRankingPrompts | `index: number, items: string[], maxPrompts: number, progressFunction?: Function` (inherited) | `void`                       | Prepares the ranking prompts for the LLM.                                                                      |
| performPairwiseRanking | `index: number` (inherited)                                             | `Promise<void>`              | Executes the pairwise ranking process for the given index.                                                     |
| getOrderedListOfItems | `index: number` (inherited)                                              | `string[]`                   | Returns the ordered list of items after ranking.                                                               |

## Example

```typescript
import { SearchQueriesRanker } from '@policysynth/agents/deepResearch/searchQueriesRanker.js';

// Example memory object (should be constructed as per PsSimpleAgentMemoryData)
const memory = {
  groupId: 1,
  lastSavedAt: Date.now(),
  // ...other fields as needed
};

const searchQueries = [
  "climate change impact on agriculture",
  "renewable energy sources",
  "carbon emissions statistics",
];

const researchQuestion = "What are the effects of climate change on food production?";

const ranker = new SearchQueriesRanker(memory);

(async () => {
  const rankedQueries = await ranker.rankSearchQueries(searchQueries, researchQuestion);
  console.log("Ranked Queries:", rankedQueries);
})();
```

---

**Note:**  
- This agent is designed to be used in environments where an LLM is available for pairwise ranking.
- The `rankSearchQueries` method is the main entry point for ranking an array of search queries for a specific research question.
- The agent uses a step-by-step prompt to the LLM to ensure careful comparison and ranking.