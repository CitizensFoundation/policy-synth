# PsRagDocumentVectorStore

A class for managing retrieval-augmented generation (RAG) document storage and search using a Weaviate vector database. This class provides methods for schema management, document CRUD operations, and advanced search capabilities, including chunk-level retrieval with references. It extends `PolicySynthSimpleAgentBase`.

**File:** `@policysynth/agents/rag/vectorstore/ragDocument.js`

---

## Properties

| Name                              | Type                | Description                                                                                 |
|------------------------------------|---------------------|---------------------------------------------------------------------------------------------|
| `allFieldsToExtract` (static)      | `string`            | GraphQL fields string for extracting all relevant document fields from Weaviate.             |
| `urlField` (static)                | `string`            | The field name for document URLs in Weaviate.                                               |
| `weaviateKey` (static)             | `string`            | The API key for Weaviate, retrieved from environment variables.                             |
| `client` (static)                  | `WeaviateClient`    | The Weaviate client instance, configured with API key and host.                             |
| `roughFastWordTokenRatio`          | `number`            | Ratio for estimating token count from word count (default: 1.25).                           |
| `maxChunkTokenLength`              | `number`            | Maximum token length for a document chunk (default: 500).                                   |
| `minQualityEloRatingForChunk`      | `number`            | Minimum quality Elo rating for a chunk to be considered (default: 920).                     |

---

## Methods

| Name                       | Parameters                                                                                      | Return Type                                      | Description                                                                                                 |
|----------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `getEstimateTokenLength`   | `data: string`                                                                                  | `number`                                         | Estimates the token length of a string based on word count and a ratio.                                     |
| `addSchema`                | *(none)*                                                                                       | `Promise<void>`                                  | Reads the RagDocument schema from disk and adds it to Weaviate.                                             |
| `showScheme`               | *(none)*                                                                                       | `Promise<void>`                                  | Logs the current Weaviate schema.                                                                           |
| `deleteScheme`             | *(none)*                                                                                       | `Promise<void>`                                  | Deletes the "RagDocument" class from Weaviate.                                                              |
| `testQuery`                | *(none)*                                                                                       | `Promise<any>`                                   | Runs a test query for "case study" documents and logs the result.                                           |
| `retry`                    | `fn: () => Promise<T>, retries?: number, delay?: number`                                       | `Promise<T>`                                     | Retries a promise-returning function up to a specified number of times with delay.                          |
| `postDocument`             | `document: PsRagDocumentSource`                                                                | `Promise<string \| undefined>`                   | Posts a new document to Weaviate and returns its ID.                                                        |
| `updateDocument`           | `id: string, documentData: PsRagDocumentSource, quiet?: boolean`                               | `Promise<any>`                                   | Updates an existing document in Weaviate by ID.                                                             |
| `getDocument`              | `id: string`                                                                                   | `Promise<PsRagDocumentSource>`                   | Retrieves a document from Weaviate by ID.                                                                   |
| `searchDocuments`          | `query: string`                                                                                | `Promise<PsRagDocumentSourceGraphQlResponse>`    | Searches for documents in Weaviate using a vector search (nearText) with the given query.                   |
| `searchDocumentsByUrl`     | `docUrl: string`                                                                              | `Promise<PsRagDocumentSourceGraphQlResponse \| null \| undefined>` | Searches for documents in Weaviate by URL.                                                                  |
| `mergeUniqueById`          | `arr1: [], arr2: []`                                                                          | `Promise<any[]>`                                 | Merges two arrays of objects, removing duplicates based on the `_additional.id` property.                   |
| `searchChunksWithReferences`| `query: string`                                                                              | `Promise<PsRagChunk[]>`                          | Searches for document chunks using both vector and BM25 search, merging results and including references.    |

---

## Example

```typescript
import { PsRagDocumentVectorStore } from '@policysynth/agents/rag/vectorstore/ragDocument.js';

// Instantiate the vector store (assumes environment variables are set)
const vectorStore = new PsRagDocumentVectorStore();

// Add the RagDocument schema to Weaviate
await vectorStore.addSchema();

// Post a new document
const docId = await vectorStore.postDocument({
  key: "unique-key",
  url: "https://example.com/doc1",
  lastModified: "2024-06-27T00:00:00Z",
  size: 12345,
  hash: "abc123",
  fileId: "file-1",
  filePath: "/docs/doc1.pdf",
  contentType: "application/pdf",
  allReferencesWithUrls: [],
  allOtherReferences: [],
  allImageUrls: [],
  documentDate: "2024-06-27",
  documentMetaData: {},
  // ...other PsRagDocumentSource fields
});

// Search for documents by query
const searchResults = await vectorStore.searchDocuments("climate change");

// Get a document by ID
const document = await vectorStore.getDocument(docId);

// Update a document
await vectorStore.updateDocument(docId, {
  ...document,
  description: "Updated description"
});

// Search for document chunks with references
const chunks = await vectorStore.searchChunksWithReferences("renewable energy");
```

---

## Types Used

- **PsRagDocumentSource**: Represents a document stored in the vector database, including metadata, content, and references.
- **PsRagDocumentSourceGraphQlResponse**: The GraphQL response structure for document queries.
- **PsRagChunk**: Represents a chunk of a document, including summaries, references, and hierarchical relationships.

---

## Notes

- The class expects Weaviate and OpenAI API keys to be set in environment variables.
- All logging is performed using `this.logger` from the base agent class.
- The class is designed for use in RAG pipelines, supporting both document-level and chunk-level retrieval.
- The `mergeUniqueById` method ensures deduplication of search results based on unique IDs.
- The `searchChunksWithReferences` method performs both vector and BM25 search, merging results for comprehensive retrieval.