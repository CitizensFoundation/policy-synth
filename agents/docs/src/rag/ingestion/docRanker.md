# IngestionDocumentRanker

The `IngestionDocumentRanker` class extends the `SimplePairwiseRankingsAgent` to rank documents based on user-defined ranking rules and an overall topic. It uses pairwise comparisons to determine the relevance of documents.

## Properties

| Name             | Type                          | Description                                      |
|------------------|-------------------------------|--------------------------------------------------|
| rankingRules     | `string \| undefined`         | The rules provided by the user for ranking.      |
| overallTopic     | `string \| undefined`         | The overall topic for the document ranking.      |
| progressFunction | `Function \| undefined`       | Function to track the progress of the ranking.   |

## Constructor

### `constructor(memory: PsSimpleAgentMemoryData | undefined = undefined, progressFunction: Function | undefined = undefined)`

Initializes a new instance of the `IngestionDocumentRanker` class.

#### Parameters

- `memory`: `PsSimpleAgentMemoryData | undefined` - Optional memory data for the agent.
- `progressFunction`: `Function | undefined` - Optional function to track the progress of the ranking.

## Methods

### `async voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>`

Compares two document chunks based on the user's ranking rules and returns the result of the comparison.

#### Parameters

- `index`: `number` - The index of the current ranking session.
- `promptPair`: `number[]` - An array containing the indices of the two document chunks to compare.

#### Returns

- `Promise<PsPairWiseVoteResults>` - The result of the pairwise vote.

### `async rankDocuments(docsToRank: PsRagDocumentSource[], rankingRules: string, overallTopic: string, eloRatingKey: string)`

Ranks a list of documents based on the provided ranking rules and overall topic.

#### Parameters

- `docsToRank`: `PsRagDocumentSource[]` - The list of documents to rank.
- `rankingRules`: `string` - The rules provided by the user for ranking.
- `overallTopic`: `string` - The overall topic for the document ranking.
- `eloRatingKey`: `string` - The key used for ELO rating.

#### Returns

- `Promise<PsRagDocumentSource[]>` - The ordered list of ranked documents.

## Example

```typescript
import { IngestionDocumentRanker } from '@policysynth/agents/rag/ingestion/docRanker.js';

const memory = undefined; // or provide a PsSimpleAgentMemoryData object
const progressFunction = (progress: number) => {
  console.log(`Progress: ${progress}%`);
};

const ranker = new IngestionDocumentRanker(memory, progressFunction);

const docsToRank = [
  // Array of PsRagDocumentSource objects
];

const rankingRules = "Relevance to AI research";
const overallTopic = "Artificial Intelligence";
const eloRatingKey = "relevanceEloRating";

ranker.rankDocuments(docsToRank, rankingRules, overallTopic, eloRatingKey)
  .then((rankedDocs) => {
    console.log("Ranked Documents:", rankedDocs);
  })
  .catch((error) => {
    console.error("Error ranking documents:", error);
  });
```

This example demonstrates how to use the `IngestionDocumentRanker` class to rank a list of documents based on user-defined ranking rules and an overall topic. The progress of the ranking process is tracked using the `progressFunction`.