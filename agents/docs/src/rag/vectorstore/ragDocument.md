# PsRagDocumentVectorStore

The `PsRagDocumentVectorStore` class is responsible for managing the interaction with a Weaviate vector store for storing and retrieving RAG (Retrieval-Augmented Generation) documents. It extends the `PolicySynthSimpleAgentBase` class and provides methods for schema management, document posting, updating, retrieval, and searching.

## Properties

| Name                          | Type                | Description                                                                 |
|-------------------------------|---------------------|-----------------------------------------------------------------------------|
| `allFieldsToExtract`          | `string`            | Static property defining the fields to extract from the Weaviate schema.     |
| `urlField`                    | `string`            | Static property defining the URL field in the schema.                        |
| `weaviateKey`                 | `string`            | Static property holding the Weaviate API key.                                |
| `client`                      | `WeaviateClient`    | Static property holding the Weaviate client instance.                        |
| `roughFastWordTokenRatio`     | `number`            | Property defining the rough word-to-token ratio.                             |
| `maxChunkTokenLength`         | `number`            | Property defining the maximum token length for a chunk.                      |
| `minQualityEloRatingForChunk` | `number`            | Property defining the minimum quality ELO rating for a chunk.                |

## Methods

| Name                    | Parameters                                                                 | Return Type                              | Description                                                                                       |
|-------------------------|---------------------------------------------------------------------------|------------------------------------------|---------------------------------------------------------------------------------------------------|
| `getWeaviateKey`        | -                                                                         | `string`                                 | Static method to retrieve the Weaviate API key from environment variables.                        |
| `getEstimateTokenLength`| `data: string`                                                            | `number`                                 | Method to estimate the token length of a given string.                                            |
| `addSchema`             | -                                                                         | `Promise<void>`                          | Method to add a schema to the Weaviate instance.                                                  |
| `showScheme`            | -                                                                         | `Promise<void>`                          | Method to display the current schema in the Weaviate instance.                                    |
| `deleteScheme`          | -                                                                         | `Promise<void>`                          | Method to delete the schema from the Weaviate instance.                                           |
| `testQuery`             | -                                                                         | `Promise<any>`                           | Method to perform a test query on the Weaviate instance.                                          |
| `retry`                 | `fn: () => Promise<T>, retries = 10, delay = 5000`                         | `Promise<T>`                             | Method to retry a given function a specified number of times with a delay between attempts.       |
| `postDocument`          | `document: PsRagDocumentSource`                                           | `Promise<string | undefined>`            | Method to post a document to the Weaviate instance.                                               |
| `updateDocument`        | `id: string, documentData: PsRagDocumentSource, quiet = false`             | `Promise<any>`                           | Method to update a document in the Weaviate instance.                                             |
| `getDocument`           | `id: string`                                                              | `Promise<PsRagDocumentSource>`           | Method to retrieve a document from the Weaviate instance by its ID.                               |
| `searchDocuments`       | `query: string`                                                           | `Promise<PsRagDocumentSourceGraphQlResponse>` | Method to search for documents in the Weaviate instance based on a query.                         |
| `searchDocumentsByUrl`  | `docUrl: string`                                                          | `Promise<PsRagDocumentSourceGraphQlResponse | null | undefined>` | Method to search for documents in the Weaviate instance based on a URL.                           |
| `mergeUniqueById`       | `arr1: [], arr2: []`                                                      | `Promise<any[]>`                         | Method to merge two arrays of objects, ensuring uniqueness by ID.                                 |
| `searchChunksWithReferences` | `query: string`                                                      | `Promise<PsRagChunk[]>`                  | Method to search for document chunks with references in the Weaviate instance based on a query.   |

## Example

```typescript
import { PsRagDocumentVectorStore } from '@policysynth/agents/rag/vectorstore/ragDocument.js';

const vectorStore = new PsRagDocumentVectorStore();

// Add schema to Weaviate
await vectorStore.addSchema();

// Show current schema
await vectorStore.showScheme();

// Delete schema from Weaviate
await vectorStore.deleteScheme();

// Post a document to Weaviate
const document = {
  title: "Sample Document",
  url: "http://example.com",
  lastModified: "2023-10-01",
  size: 12345,
  description: "This is a sample document.",
  shortDescription: "Sample document",
  fullDescriptionOfAllContents: "Full content of the sample document.",
  compressedFullDescriptionOfAllContents: "Compressed content of the sample document.",
  contentType: "text/html",
  allReferencesWithUrls: ["http://example.com/ref1", "http://example.com/ref2"],
  allOtherReferences: ["Reference 1", "Reference 2"],
  allImageUrls: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"],
  documentMetaData: { author: "John Doe", category: "Sample" }
};

const documentId = await vectorStore.postDocument(document);
console.log(`Document posted with ID: ${documentId}`);

// Search for documents
const searchResults = await vectorStore.searchDocuments("sample query");
console.log(searchResults);
```

This example demonstrates how to use the `PsRagDocumentVectorStore` class to interact with a Weaviate vector store, including adding a schema, posting a document, and searching for documents.