# DocumentTreeSplitAgent

The `DocumentTreeSplitAgent` class is an advanced ingestion agent designed to split a text document into logical chapters and sub-chunks using a recursive, LLM-driven strategy. It leverages large language models (LLMs) to generate, review, and validate chunking strategies, ensuring that the document is split in a way that is optimal for downstream tasks such as retrieval-augmented generation (RAG).

This agent is particularly useful for preparing large documents for semantic search, chunked storage, or AI-powered analysis, where logical segmentation is critical.

**File:** `@policysynth/agents/rag/ingestion/docTreeSplitter.js`

---

## Properties

| Name                      | Type      | Description                                                                                      |
|---------------------------|-----------|--------------------------------------------------------------------------------------------------|
| `maxSplitRetries`         | `number`  | Maximum number of retries for chunking strategy validation (default: 20).                        |
| `minChunkCharacterLength` | `number`  | Minimum character length for a chunk (default: 50).                                              |
| `maxChunkLinesLength`     | `number`  | Maximum number of lines allowed in a chunk before sub-chunking is triggered (default: 15).       |
| `strategySystemMessage`   | `string`  | System prompt for the LLM to generate a chunking strategy.                                       |
| `strategyUserMessage`     | `(data: string) => string` | Function to generate the user message for the LLM with the document to analyze.         |
| `strategyWithReviewUserMessage` | `(data: string, lastAttempt: string, reviewComments: string) => string` | Function to generate a user message for the LLM with review feedback. |
| `reviewStrategySystemMessage` | `string` | System prompt for the LLM to review a chunking strategy.                                         |
| `reviewStrategyUserMessage` | `(data: string, splitStrategy: string) => string` | Function to generate the user message for the LLM to review a strategy.                |
| `aggregateChunkData`      | `(chunks: LlmDocumentChunksStrategy[]) => string` | Aggregates all chunk data (including sub-chunks) into a single string.                |

---

## Methods

| Name                          | Parameters                                                                                                   | Return Type                                      | Description                                                                                                   |
|-------------------------------|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `generateDiff`                | `str1: string, str2: string`                                                                                 | `string`                                         | Finds and describes the first difference between two strings, providing context for debugging.                |
| `fetchLlmChunkingStrategy`    | `data: string, review: string \| undefined, lastJson: LlmDocumentChunksStrategy[] \| undefined`              | `Promise<{ chunkingStrategy: string, chunkingStrategyReview: string, lastChunkingStrategyJson: LlmDocumentChunksStrategy[] }>` | Calls the LLM to generate and review a chunking strategy for the document.                                    |
| `aggregateChunkData`          | `chunks: LlmDocumentChunksStrategy[]`                                                                        | `string`                                         | Recursively aggregates all chunk and sub-chunk data into a single string.                                     |
| `normalizeLineBreaks`         | `text: string`                                                                                               | `string`                                         | Removes all line breaks from the input string for normalization.                                              |
| `splitDocumentIntoChunks`     | `data: string, isSubChunk: boolean = false, totalLinesInChunk?: number`                                      | `Promise<LlmDocumentChunksStrategy[] \| undefined>` | Recursively splits a document into chunks and sub-chunks using LLM-generated strategies and validation.       |

---

## Chunk Interface

```typescript
interface Chunk {
  data: string;
  startLine: number;
  actualStartLine?: number;
  actualEndLine?: number;
  subChunks?: Chunk[];
}
```

---

## Example

```typescript
import { DocumentTreeSplitAgent } from '@policysynth/agents/rag/ingestion/docTreeSplitter.js';

const agent = new DocumentTreeSplitAgent();

// Example document to split
const documentText = `
Introduction to AI
Artificial Intelligence (AI) is a field...
...
References
[1] Some reference
`;

// Split the document into logical chunks
(async () => {
  const chunks = await agent.splitDocumentIntoChunks(documentText);
  console.log(JSON.stringify(chunks, null, 2));
})();
```

---

## Detailed Description

- **LLM-Driven Strategy**: The agent uses LLM prompts to generate a strategy for splitting the document into chapters, taking into account line numbers, chapter titles, and context connections.
- **Recursive Sub-chunking**: If a chunk exceeds the maximum allowed lines, it is recursively split into sub-chunks.
- **Validation and Review**: Each chunking strategy is reviewed by the LLM. If the strategy fails validation, the agent retries (up to `maxSplitRetries`).
- **Data Integrity**: After chunking, the agent aggregates all chunk data and compares it to the original document (ignoring line breaks) to ensure no data is lost or altered.
- **Logging**: The agent logs progress, validation results, and any differences found during validation for debugging and traceability.

---

## Use Cases

- **Document Ingestion Pipelines**: Preprocessing large documents for semantic search or RAG.
- **AI Knowledge Bases**: Preparing documents for chunked storage and retrieval.
- **Automated Content Structuring**: Structuring unstructured text into logical, navigable sections.

---

## Notes

- The agent expects the document to be provided as a string.
- The chunking process is robust to LLM errors and will retry with feedback if the initial strategy is not valid.
- The agent is designed to be extended or integrated into larger ingestion or RAG pipelines.

---

## Related Types

- `LlmDocumentChunksStrategy[]`: The main structure for chunking strategies, including chapter indices, titles, start lines, and context connections.
- `Chunk`: The recursive structure representing a chunk and its sub-chunks.

---

**See also:**  
- [BaseIngestionAgent](./baseAgent.js) for base agent functionality.
- [LlmDocumentChunksStrategy](#) for the chunking strategy structure (see your type definitions).

---