# IngestionChunkRanker

This class extends `BasePairwiseRankingsProcessor` to rank document chunks based on user-defined rules and document summaries.

## Properties

| Name             | Type                        | Description               |
|------------------|-----------------------------|---------------------------|
| rankingRules     | string \| undefined         | User-defined ranking rules. |
| documentSummary  | string \| undefined         | Summary of the document to be ranked. |

## Methods

| Name               | Parameters                                                                 | Return Type                    | Description                                                                 |
|--------------------|----------------------------------------------------------------------------|--------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair   | index: number, promptPair: number[]                                        | Promise<IEnginePairWiseVoteResults> | Processes a pair of prompts for ranking based on the set rules and summaries. |
| rankDocumentChunks | chunksToRank: PsRagChunk[], rankingRules: string, documentSummary: string, eloRatingKey: string | Promise<PsRagChunk[]>         | Ranks a list of document chunks based on the provided rules and summaries. |

## Example

```typescript
import { IngestionChunkRanker } from '@policysynth/agents/rag/ingestion/chunkRanker.js';

// Initialize the ranker with optional memory and progress function
const ranker = new IngestionChunkRanker();

// Define ranking rules and document summary
const rankingRules = "Relevance to the topic, clarity of information, and conciseness.";
const documentSummary = "This document discusses the impact of AI on modern industries.";

// Example chunks to rank
const chunksToRank = [
  { compressedContent: "AI is transforming industries.", fullSummary: "AI's impact is profound in sectors like healthcare." },
  { compressedContent: "AI boosts productivity.", fullSummary: "AI applications streamline processes across industries." }
];

// Rank the document chunks
const rankedChunks = await ranker.rankDocumentChunks(chunksToRank, rankingRules, documentSummary, "eloRatingKey");

// Output the ranked chunks
console.log(rankedChunks);
```
