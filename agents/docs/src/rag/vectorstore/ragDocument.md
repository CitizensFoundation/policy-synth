# PsRagDocumentVectorStore

This class is responsible for managing document vectors in a Weaviate vector store, including operations like adding, updating, deleting, and querying document schemas and data.

## Properties

| Name                            | Type    | Description                                           |
|---------------------------------|---------|-------------------------------------------------------|
| roughFastWordTokenRatio         | number  | The ratio used to estimate token length from words.   |
| maxChunkTokenLength             | number  | The maximum token length for a chunk.                 |
| minQualityEloRatingForChunk     | number  | The minimum quality Elo rating for a chunk.           |

## Methods

| Name                        | Parameters                                  | Return Type                  | Description                                      |
|-----------------------------|---------------------------------------------|------------------------------|--------------------------------------------------|
| getEstimateTokenLength      | data: string                                | number                       | Estimates the token length of the provided data. |
| addSchema                   |                                             | Promise<void>                | Adds a schema to the Weaviate client.            |
| showScheme                  |                                             | Promise<void>                | Shows the current schema in the Weaviate client. |
| deleteScheme                |                                             | Promise<void>                | Deletes a schema from the Weaviate client.       |
| testQuery                   |                                             | Promise<any>                 | Tests a query against the Weaviate client.       |
| retry                       | fn: () => Promise<T>, retries: number, delay: number | Promise<T> | Retries a function based on the specified parameters. |
| postDocument                | document: PsRagDocumentSource              | Promise<string \| undefined> | Posts a document to the Weaviate client.         |
| updateDocument              | id: string, documentData: PsRagDocumentSource, quiet: boolean | Promise<any> | Updates a document in the Weaviate client.       |
| getDocument                 | id: string                                  | Promise<PsRagDocumentSource> | Retrieves a document by ID from the Weaviate client. |
| searchDocuments             | query: string                               | Promise<PsRagDocumentSourceGraphQlResponse> | Searches documents based on a query.            |
| searchDocumentsByUrl        | docUrl: string                              | Promise<PsRagDocumentSourceGraphQlResponse \| null \| undefined> | Searches documents by URL. |
| mergeUniqueById             | arr1: [], arr2: []                          | Promise<any[]>               | Merges two arrays and filters out duplicates.    |
| searchChunksWithReferences  | query: string                               | Promise<PsRagChunk[]>        | Searches for document chunks with references based on a query. |

## Example

```typescript
import { PsRagDocumentVectorStore } from '@policysynth/agents/rag/vectorstore/ragDocument.js';

const vectorStore = new PsRagDocumentVectorStore();

// Example usage to add a schema
vectorStore.addSchema().then(() => {
  console.log('Schema added successfully.');
}).catch(err => {
  console.error('Failed to add schema:', err);
});

// Example usage to post a document
const document = {
  title: "Example Document",
  url: "http://example.com",
  description: "A sample document for demonstration purposes."
};

vectorStore.postDocument(document).then(id => {
  console.log('Document posted with ID:', id);
}).catch(err => {
  console.error('Failed to post document:', err);
});
```