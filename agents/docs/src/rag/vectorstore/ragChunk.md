# PsRagChunkVectorStore

A class for managing vector storage of RAG (Retrieval-Augmented Generation) document chunks in a Weaviate vector database. This class provides methods for schema management, chunk CRUD operations, cross-referencing, and advanced search with filtering and references. It extends `PolicySynthSimpleAgentBase` and is designed for use in PolicySynth agent pipelines.

**File:** `@policysynth/agents/rag/vectorstore/ragChunk.js`

---

## Properties

| Name                    | Type             | Description                                                                                      |
|-------------------------|------------------|--------------------------------------------------------------------------------------------------|
| allFieldsToExtract      | `string`         | GraphQL fields string for extracting all relevant chunk fields from Weaviate.                    |
| weaviateKey             | `string`         | The API key used to authenticate with the Weaviate instance.                                     |
| client                  | `WeaviateClient` | Static Weaviate client instance configured with environment variables and API key.               |

---

## Methods

| Name                          | Parameters                                                                                                                                                                                                 | Return Type                        | Description                                                                                                                      |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `addSchema()`                 | none                                                                                                                                                                                                       | `Promise<void>`                     | Reads the RagChunk schema from disk and creates it in Weaviate. Logs errors if any.                                              |
| `showScheme()`                | none                                                                                                                                                                                                       | `Promise<void>`                     | Retrieves and logs the current Weaviate schema.                                                                                  |
| `deleteScheme()`              | none                                                                                                                                                                                                       | `Promise<void>`                     | Deletes the "RagDocumentChunk" class from Weaviate.                                                                              |
| `testQuery()`                 | none                                                                                                                                                                                                       | `Promise<any>`                      | Runs a test GraphQL query for "RagDocumentChunk" with a sample concept. Returns and logs the result.                             |
| `retry(fn, retries, delay)`   | `fn: () => Promise<T>`, `retries: number = 10`, `delay: number = 5000`                                                                                                                                    | `Promise<T>`                        | Retries a promise-returning function up to `retries` times with a delay. Throws error if all retries fail.                       |
| `postChunk(chunkData)`        | `chunkData: PsRagChunk`                                                                                                                                                                                    | `Promise<string \| undefined>`      | Posts a new chunk to Weaviate, with retry logic. Returns the chunk's ID if successful.                                           |
| `addCrossReference(...)`      | `sourceId: string`, `propertyName: string`, `targetId: string`, `targetClassName: string`                                                                                                                  | `Promise<any>`                      | Adds a cross-reference from one chunk to another in Weaviate.                                                                    |
| `updateChunk(id, chunkData, quiet)` | `id: string`, `chunkData: PsRagChunk`, `quiet: boolean = false`                                                                                                                                      | `Promise<any>`                      | Updates an existing chunk in Weaviate. Logs the update unless `quiet` is true.                                                   |
| `getChunk(id)`                | `id: string`                                                                                                                                                                                              | `Promise<PsRagChunk>`               | Retrieves a chunk by ID from Weaviate.                                                                                           |
| `searchChunks(query)`         | `query: string`                                                                                                                                                                                           | `Promise<PsRagChunkGraphQlResponse>`| Searches for chunks using a text query. Returns a GraphQL response with chunk data.                                              |
| `searchChunksWithReferences(query, minRelevanceEloRating, minSubstanceEloRating)` | `query: string`, `minRelevanceEloRating: number = 900`, `minSubstanceEloRating: number = 900`                                                      | `Promise<PsRagChunkGraphQlResponse>`| Searches for chunks with references, filtering by minimum relevance and substance Elo ratings. Returns a detailed GraphQL result. |

---

## Example

```typescript
import { PsRagChunkVectorStore } from '@policysynth/agents/rag/vectorstore/ragChunk.js';

// Example: Add schema to Weaviate
const vectorStore = new PsRagChunkVectorStore();
await vectorStore.addSchema();

// Example: Post a new chunk
const chunkData = {
  title: "Introduction to Policy",
  chunkIndex: 0,
  chapterIndex: 0,
  mainExternalUrlFound: "https://example.com/policy",
  shortSummary: "A brief intro.",
  fullSummary: "A detailed introduction to policy making.",
  relevanceEloRating: 950,
  qualityEloRating: 900,
  substanceEloRating: 920,
  uncompressedContent: "Full text of the chunk...",
  compressedContent: "Compressed text...",
  metaDataFields: ["author", "date"],
  metaData: { author: "Jane Doe", date: "2024-06-27" },
  // ...other PsRagChunk fields
};
const chunkId = await vectorStore.postChunk(chunkData);

// Example: Search for chunks
const searchResults = await vectorStore.searchChunks("policy introduction");

// Example: Update a chunk
await vectorStore.updateChunk(chunkId, { ...chunkData, shortSummary: "Updated summary" });

// Example: Add a cross-reference
await vectorStore.addCrossReference(chunkId, "relatedChunks", "targetChunkId", "RagDocumentChunk");

// Example: Get a chunk by ID
const retrievedChunk = await vectorStore.getChunk(chunkId);

// Example: Search with references and Elo rating filters
const advancedResults = await vectorStore.searchChunksWithReferences("policy", 950, 900);
```

---

## Type Details

- **PsRagChunk**: Represents a chunk of a document, including metadata, summaries, ratings, and references. See project type definitions for full details.
- **PsRagChunkGraphQlResponse**: The GraphQL response structure for chunk queries, containing an array of `PsRagChunk` objects.

---

## Notes

- The class uses environment variables for Weaviate and OpenAI API keys.
- All logging is done via `this.logger`.
- The class is designed for use in Node.js ES modules (uses `import.meta.url` and `fs/promises`).
- Retry logic is provided for robust posting of chunks.
- The schema file for RagChunk must be present at `./schemas/RagChunk.json` relative to this file.

---

**See also:**  
- [PolicySynthSimpleAgentBase](../../base/simpleAgent.js)  
- [weaviate-ts-client documentation](https://www.npmjs.com/package/weaviate-ts-client)  
- [PsRagChunk type definition](see project types)  
