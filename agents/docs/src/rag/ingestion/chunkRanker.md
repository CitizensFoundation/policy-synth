# IngestionChunkRanker

The `IngestionChunkRanker` class extends the `SimplePairwiseRankingsAgent` to rank chunks of documents based on their relevance to user-defined ranking rules. It leverages a pairwise ranking mechanism to determine the most relevant chunks.

## Properties

| Name               | Type                          | Description                                                                 |
|--------------------|-------------------------------|-----------------------------------------------------------------------------|
| `rankingRules`     | `string \| undefined`         | The rules provided by the user for ranking the document chunks.             |
| `documentSummary`  | `string \| undefined`         | A summary of the document to provide context for the ranking process.       |
| `maxModelTokensOut`| `number`                      | The maximum number of tokens the model should output. Default is set to `3`.|
| `modelTemperature` | `number`                      | The temperature setting for the model. Default is set to `0.0`.             |
| `progressFunction` | `Function \| undefined`       | A function to track the progress of the ranking process.                    |

## Constructor

### `constructor(memory: PsSimpleAgentMemoryData | undefined = undefined, progressFunction: Function | undefined = undefined)`

Initializes a new instance of the `IngestionChunkRanker` class.

| Parameter         | Type                          | Description                                                                 |
|-------------------|-------------------------------|-----------------------------------------------------------------------------|
| `memory`          | `PsSimpleAgentMemoryData \| undefined` | The memory data for the agent. Optional.                                    |
| `progressFunction`| `Function \| undefined`       | A function to track the progress of the ranking process. Optional.          |

## Methods

### `async voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>`

Ranks a pair of document chunks based on their relevance to the user's ranking rules.

| Parameter   | Type       | Description                                                                 |
|-------------|------------|-----------------------------------------------------------------------------|
| `index`     | `number`   | The index of the current ranking process.                                    |
| `promptPair`| `number[]` | An array containing the indices of the two document chunks to be ranked.     |

**Returns:** `Promise<PsPairWiseVoteResults>` - The result of the pairwise vote.

### `async rankDocumentChunks(chunksToRank: PsRagChunk[], rankingRules: string, documentSummary: string, eloRatingKey: string)`

Ranks a list of document chunks based on the provided ranking rules and document summary.

| Parameter        | Type            | Description                                                                 |
|------------------|-----------------|-----------------------------------------------------------------------------|
| `chunksToRank`   | `PsRagChunk[]`  | An array of document chunks to be ranked.                                   |
| `rankingRules`   | `string`        | The rules provided by the user for ranking the document chunks.             |
| `documentSummary`| `string`        | A summary of the document to provide context for the ranking process.       |
| `eloRatingKey`   | `string`        | The key used for ELO rating.                                                |

**Returns:** `Promise<PsRagChunk[]>` - The ranked list of document chunks.

## Example

```typescript
import { IngestionChunkRanker } from '@policysynth/agents/rag/ingestion/chunkRanker.js';

const memory = undefined; // or some PsSimpleAgentMemoryData
const progressFunction = (progress: number) => console.log(`Progress: ${progress}%`);

const chunkRanker = new IngestionChunkRanker(memory, progressFunction);

const chunksToRank = [/* array of PsRagChunk objects */];
const rankingRules = "Relevance to the topic";
const documentSummary = "This document discusses various aspects of AI and machine learning.";
const eloRatingKey = "relevance";

chunkRanker.rankDocumentChunks(chunksToRank, rankingRules, documentSummary, eloRatingKey)
  .then(rankedChunks => {
    console.log("Ranked Chunks:", rankedChunks);
  })
  .catch(error => {
    console.error("Error ranking chunks:", error);
  });
```

This example demonstrates how to use the `IngestionChunkRanker` class to rank document chunks based on user-defined rules and a document summary.