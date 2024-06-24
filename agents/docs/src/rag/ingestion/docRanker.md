# IngestionDocumentRanker

This class is responsible for ranking documents based on user-defined rules and topics, extending the functionality of `BasePairwiseRankingsProcessor`.

## Properties

| Name          | Type                      | Description               |
|---------------|---------------------------|---------------------------|
| rankingRules  | string \| undefined       | User-defined rules for ranking documents. |
| overallTopic  | string \| undefined       | The overall topic of the documents to be ranked. |

## Methods

| Name             | Parameters                                                                 | Return Type                             | Description |
|------------------|----------------------------------------------------------------------------|-----------------------------------------|-------------|
| voteOnPromptPair | index: number, promptPair: number[]                                        | Promise<PsPairWiseVoteResults>     | Processes a pair of prompts and votes on their relevance based on the ranking rules and overall topic. |
| rankDocuments    | docsToRank: PsRagDocumentSource[], rankingRules: string, overallTopic: string, eloRatingKey: string | Promise<PsRagDocumentSource[]> | Ranks a list of documents based on the specified rules and topic, and returns them ordered by relevance. |

## Example

```typescript
import { IngestionDocumentRanker } from '@policysynth/agents/rag/ingestion/docRanker.js';
import { PsRagDocumentSource, PsSmarterCrowdsourcingMemoryData } from '@policysynth/agents/rag/ingestion/types';

const ranker = new IngestionDocumentRanker();

const documents: PsRagDocumentSource[] = [
  { fullDescriptionOfAllContents: "Document content 1" },
  { fullDescriptionOfAllContents: "Document content 2" }
];

const rankingRules = "Relevance to the current market trends";
const overallTopic = "Technology";
const eloRatingKey = "tech-docs-ranking";

async function rankDocuments() {
  const rankedDocuments = await ranker.rankDocuments(documents, rankingRules, overallTopic, eloRatingKey);
  console.log(rankedDocuments);
}

rankDocuments();
```