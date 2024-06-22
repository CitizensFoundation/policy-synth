# PsRagChunkVectorStore

This class manages the storage and retrieval of document chunks in a vector database using Weaviate. It extends the functionality of the `PolicySynthScAgentBase` class.

## Properties

| Name                | Type            | Description                                           |
|---------------------|-----------------|-------------------------------------------------------|
| allFieldsToExtract  | string          | A string listing all the fields to extract from queries. |
| weaviateKey         | string          | The API key used for authenticating with the Weaviate client. |
| client              | WeaviateClient  | An instance of WeaviateClient configured for interaction with the Weaviate server. |

## Methods

| Name                      | Parameters                                                                 | Return Type                  | Description                                                                 |
|---------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| addSchema                 | -                                                                          | Promise<void>                | Reads a JSON schema from a file and adds it to the Weaviate schema.         |
| showScheme                | -                                                                          | Promise<void>                | Fetches and displays the current schema from Weaviate.                      |
| deleteScheme              | -                                                                          | Promise<void>                | Deletes the 'RagDocumentChunk' class from the Weaviate schema.              |
| testQuery                 | -                                                                          | Promise<any>                 | Executes a test query to fetch document chunks based on a concept.          |
| retry                     | fn: () => Promise<T>, retries: number = 10, delay: number = 5000           | Promise<T>                   | Retries a given function a specified number of times with a delay.          |
| postChunk                 | chunkData: PsRagChunk                                                      | Promise<string \| undefined> | Posts a chunk to Weaviate and returns the ID of the created object.         |
| addCrossReference         | sourceId: string, propertyName: string, targetId: string, targetClassName: string | Promise<any>                 | Adds a cross-reference between two objects in Weaviate.                     |
| updateChunk               | id: string, chunkData: PsRagChunk, quiet: boolean = false                  | Promise<any>                 | Updates a chunk in Weaviate with new data.                                  |
| getChunk                  | id: string                                                                 | Promise<PsRagChunk>          | Retrieves a chunk from Weaviate by ID.                                      |
| searchChunks              | query: string                                                              | Promise<PsRagChunkGraphQlResponse> | Searches for chunks in Weaviate that match a given query.                   |
| searchChunksWithReferences| query: string, minRelevanceEloRating: number = 900, minSubstanceEloRating: number = 900 | Promise<PsRagChunkGraphQlResponse> | Searches for chunks and their references based on a query and minimum ratings. |

## Example

```typescript
import { PsRagChunkVectorStore } from '@policysynth/agents/rag/vectorstore/ragChunk.js';

const vectorStore = new PsRagChunkVectorStore();

// Example usage to add schema
vectorStore.addSchema().then(() => {
  console.log('Schema added successfully');
}).catch(err => {
  console.error('Failed to add schema:', err);
});

// Example usage to post a chunk
const chunkData = {
  title: "Example Chunk",
  chunkIndex: 1,
  chapterIndex: 1,
  mainExternalUrlFound: "http://example.com",
  shortSummary: "This is a short summary.",
  fullSummary: "This is a detailed full summary.",
  relevanceEloRating: 1000,
  qualityEloRating: 1000,
  substanceEloRating: 1000,
  uncompressedContent: "Full uncompressed content of the chunk.",
  compressedContent: "Compressed content of the chunk.",
  metaDataFields: ["field1", "field2"],
  metaData: { field1: "data1", field2: "data2" }
};

vectorStore.postChunk(chunkData).then(id => {
  console.log('Chunk posted with ID:', id);
}).catch(err => {
  console.error('Failed to post chunk:', err);
});
```