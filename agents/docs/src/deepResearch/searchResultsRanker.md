# SearchResultsRanker

A specialized agent for ranking web search results based on their relevance to a user-provided research question. Inherits from `SimplePairwiseRankingsAgent` and uses pairwise comparison to determine the most relevant search results.

**File:** `@policysynth/agents/deepResearch/searchResultsRanker.js`

## Properties

| Name             | Type                          | Description                                               |
|------------------|------------------------------|-----------------------------------------------------------|
| searchQuestion   | `string \| undefined`         | The research question used to evaluate search results.     |
| progressFunction | `Function \| undefined`       | Optional function to report progress during ranking.       |

## Methods

| Name                | Parameters                                                                                      | Return Type                        | Description                                                                                                    |
|---------------------|------------------------------------------------------------------------------------------------|------------------------------------|----------------------------------------------------------------------------------------------------------------|
| constructor         | `memory: PsSimpleAgentMemoryData, progressFunction?: Function`                                 | `SearchResultsRanker`              | Initializes the agent with memory and an optional progress callback.                                           |
| voteOnPromptPair    | `index: number, promptPair: number[]`                                                          | `Promise<PsPairWiseVoteResults>`   | Compares two search results and determines which is more relevant to the research question using an LLM.       |
| rankSearchResults   | `queriesToRank: PsSearchResultItem[], searchQuestion: string, maxPrompts?: number`             | `Promise<PsSearchResultItem[]>`    | Ranks a list of search results for a given research question and returns them in order of relevance.           |

## Method Details

### constructor

```typescript
constructor(
  memory: PsSimpleAgentMemoryData,
  progressFunction?: Function
)
```
- **Description:** Creates a new `SearchResultsRanker` instance.
- **Parameters:**
  - `memory`: The agent's memory data.
  - `progressFunction` (optional): A callback for reporting progress.

### voteOnPromptPair

```typescript
async voteOnPromptPair(
  index: number,
  promptPair: number[]
): Promise<PsPairWiseVoteResults>
```
- **Description:** Given a pair of search result indices, prompts an LLM to decide which result is more relevant to the research question. Returns the result of the pairwise vote.
- **Parameters:**
  - `index`: The ranking session index (usually -1 for single session).
  - `promptPair`: An array of two indices representing the search results to compare.
- **Returns:** A promise resolving to a `PsPairWiseVoteResults` object indicating the winner.

### rankSearchResults

```typescript
async rankSearchResults(
  queriesToRank: PsSearchResultItem[],
  searchQuestion: string,
  maxPrompts = 150
): Promise<PsSearchResultItem[]>
```
- **Description:** Ranks a list of search results according to their relevance to the provided research question using pairwise comparison and returns the ordered list.
- **Parameters:**
  - `queriesToRank`: Array of search result items to rank.
  - `searchQuestion`: The research question to use for ranking.
  - `maxPrompts` (optional): Maximum number of pairwise prompts to use (default: 150).
- **Returns:** A promise resolving to an array of `PsSearchResultItem` in ranked order.

## Example

```typescript
import { SearchResultsRanker } from '@policysynth/agents/deepResearch/searchResultsRanker.js';

// Example memory object (should be constructed as needed)
const memory = {
  groupId: 1,
  // ...other PsSimpleAgentMemoryData fields
};

const searchResults = [
  {
    title: "OpenAI launches GPT-4",
    originalPosition: 0,
    description: "OpenAI has released GPT-4, a large multimodal model.",
    url: "https://openai.com/gpt-4",
    date: "2023-03-14"
  },
  {
    title: "Google announces Bard",
    originalPosition: 1,
    description: "Google introduces Bard, its conversational AI.",
    url: "https://blog.google/technology/ai/bard-google-ai/",
    date: "2023-02-06"
  }
  // ...more PsSearchResultItem objects
];

const ranker = new SearchResultsRanker(memory);

(async () => {
  const rankedResults = await ranker.rankSearchResults(
    searchResults,
    "What are the latest advancements in conversational AI?"
  );
  console.log(rankedResults);
})();
```

---

**Note:**  
- This class is designed to be used in research agents that need to rank search results using LLM-based pairwise comparison.
- It expects the parent class `SimplePairwiseRankingsAgent` to provide methods like `setupRankingPrompts`, `performPairwiseRanking`, and `getOrderedListOfItems`.
- The LLM is prompted with clear instructions to choose the most relevant result for each pair.