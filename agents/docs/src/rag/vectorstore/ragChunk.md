# PsRagChunkVectorStore

The `PsRagChunkVectorStore` class is a specialized class for managing and interacting with a Weaviate vector store for RAG (Retrieval-Augmented Generation) document chunks. It extends the `PolicySynthSimpleAgentBase` class and provides methods for schema management, data insertion, querying, and updating.

## Properties

| Name                    | Type             | Description                                                                 |
|-------------------------|------------------|-----------------------------------------------------------------------------|
| allFieldsToExtract      | `string`         | A static string containing all the fields to extract from the Weaviate schema. |
| weaviateKey             | `string`         | A static string containing the Weaviate API key.                             |
| client                  | `WeaviateClient` | A static instance of the Weaviate client.                                    |

## Methods

| Name                        | Parameters                                                                 | Return Type                  | Description                                                                                       |
|-----------------------------|----------------------------------------------------------------------------|------------------------------|---------------------------------------------------------------------------------------------------|
| getWeaviateKey              | None                                                                       | `string`                     | Retrieves the Weaviate API key from environment variables.                                         |
| addSchema                   | None                                                                       | `Promise<void>`              | Adds a schema to the Weaviate instance.                                                           |
| showScheme                  | None                                                                       | `Promise<void>`              | Displays the current schema in the Weaviate instance.                                             |
| deleteScheme                | None                                                                       | `Promise<void>`              | Deletes the schema from the Weaviate instance.                                                    |
| testQuery                   | None                                                                       | `Promise<any>`               | Executes a test query against the Weaviate instance.                                              |
| retry                       | `fn: () => Promise<T>, retries = 10, delay = 5000`                          | `Promise<T>`                 | Retries a function multiple times with a delay between attempts.                                  |
| postChunk                   | `chunkData: PsRagChunk`                                                    | `Promise<string | undefined>` | Posts a chunk of data to the Weaviate instance.                                                   |
| addCrossReference           | `sourceId: string, propertyName: string, targetId: string, targetClassName: string` | `Promise<any>`               | Adds a cross-reference between two objects in the Weaviate instance.                              |
| updateChunk                 | `id: string, chunkData: PsRagChunk, quiet = false`                         | `Promise<any>`               | Updates a chunk of data in the Weaviate instance.                                                 |
| getChunk                    | `id: string`                                                               | `Promise<PsRagChunk>`        | Retrieves a chunk of data from the Weaviate instance by its ID.                                   |
| searchChunks                | `query: string`                                                            | `Promise<PsRagChunkGraphQlResponse>` | Searches for chunks in the Weaviate instance based on a query.                                    |
| searchChunksWithReferences  | `query: string, minRelevanceEloRating = 900, minSubstanceEloRating = 900`  | `Promise<PsRagChunkGraphQlResponse>` | Searches for chunks in the Weaviate instance based on a query, including references and filters.  |

## Example

```typescript
import { PsRagChunkVectorStore } from '@policysynth/agents/rag/vectorstore/ragChunk.js';

const vectorStore = new PsRagChunkVectorStore();

// Add schema
await vectorStore.addSchema();

// Show schema
await vectorStore.showScheme();

// Delete schema
await vectorStore.deleteScheme();

// Test query
const testQueryResult = await vectorStore.testQuery();
console.log(testQueryResult);

// Post a chunk
const chunkData = {
  title: "Example Chunk",
  chunkIndex: 1,
  chapterIndex: 1,
  mainExternalUrlFound: "http://example.com",
  shortSummary: "This is a short summary.",
  fullSummary: "This is a full summary.",
  relevanceEloRating: 1000,
  qualityEloRating: 1000,
  substanceEloRating: 1000,
  uncompressedContent: "This is the uncompressed content.",
  compressedContent: "This is the compressed content.",
  metaDataFields: ["field1", "field2"],
  metaData: { field1: "value1", field2: "value2" },
  category1EloRating: 1000,
  category2EloRating: 1000,
  category3EloRating: 1000,
  category4EloRating: 1000,
  category5EloRating: 1000,
  category6EloRating: 1000,
  category7EloRating: 1000,
  category8EloRating: 1000,
  category9EloRating: 1000,
  category10EloRating: 1000,
  _additional: { id: "1", distance: 0.1, certainty: 0.9 }
};

const chunkId = await vectorStore.postChunk(chunkData);
console.log(`Posted chunk with ID: ${chunkId}`);

// Add cross-reference
await vectorStore.addCrossReference("sourceId", "propertyName", "targetId", "targetClassName");

// Update a chunk
await vectorStore.updateChunk("chunkId", chunkData);

// Get a chunk
const retrievedChunk = await vectorStore.getChunk("chunkId");
console.log(retrievedChunk);

// Search chunks
const searchResults = await vectorStore.searchChunks("example query");
console.log(searchResults);

// Search chunks with references
const searchResultsWithReferences = await vectorStore.searchChunksWithReferences("example query");
console.log(searchResultsWithReferences);
```

This documentation provides a comprehensive overview of the `PsRagChunkVectorStore` class, including its properties, methods, and an example of how to use it.