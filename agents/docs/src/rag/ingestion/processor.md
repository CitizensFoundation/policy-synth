# IngestionAgentProcessor

The `IngestionAgentProcessor` is an abstract class for orchestrating the ingestion, processing, analysis, chunking, ranking, and storage of documents and their metadata for RAG (Retrieval-Augmented Generation) pipelines. It handles downloading documents, caching, metadata management, chunking, analysis, ranking, and uploading to vector stores (e.g., Weaviate). It is designed to be extended for specific ingestion workflows.

**File:** `@policysynth/agents/rag/ingestion/processor.js`

---

## Properties

| Name                  | Type                                         | Description                                                                                   |
|-----------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| dataLayoutPath        | `string`                                     | Path or URL to the data layout JSON describing documents to ingest.                            |
| cachedFiles           | `string[]`                                   | List of cached file paths.                                                                    |
| fileMetadataPath      | `string`                                     | Path to the file metadata JSON cache.                                                         |
| fileMetadata          | `Record<string, any>`                        | Metadata for all processed files, keyed by fileId.                                            |
| initialFileMetadata   | `Record<string, any>`                        | Deep copy of file metadata at the start of processing, for change detection.                  |
| cleanupAgent          | `DocumentCleanupAgent`                       | Agent for cleaning up document content.                                                       |
| splitAgent            | `DocumentTreeSplitAgent`                     | Agent for splitting documents into hierarchical chunks.                                       |
| chunkCompressor       | `IngestionChunkCompressorAgent`              | Agent for compressing chunk data.                                                             |
| chunkAnalysisAgent    | `IngestionChunkAnalzyerAgent`                | Agent for analyzing document chunks.                                                          |
| docAnalysisAgent      | `DocumentAnalyzerAgent`                      | Agent for analyzing full documents.                                                           |
| dataLayout            | `PsIngestionDataLayout`                      | The loaded data layout object (see type definition).                                          |

---

## Methods

| Name                                   | Parameters                                                                                                    | Return Type                | Description                                                                                                   |
|---------------------------------------- |--------------------------------------------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------|
| constructor                            | `dataLayoutPath?: string`                                                                                    | `void`                     | Initializes the processor, loads file metadata, and instantiates agents.                                      |
| processDataLayout                      | none                                                                                                         | `Promise<void>`            | Main entry point: loads data layout, downloads/caches files, processes files, and uploads to vector store.    |
| processAllSources                      | `allDocumentSources: PsRagDocumentSource[]`                                                                  | `Promise<void>`            | Processes all document sources, filters those with chunks, and adds them to the vector store.                 |
| stringifyIfObjectOrArray               | `value: any`                                                                                                 | `string`                   | Converts objects/arrays to JSON strings, otherwise returns as-is.                                             |
| transformChunkForVectorstore           | `chunk: PsRagChunk`                                                                                          | `PsRagChunk`               | Prepares a chunk for storage in the vector store by removing/serializing certain fields.                      |
| transformDocumentSourceForVectorstore  | `source: PsRagDocumentSource`                                                                                | `PsRagDocumentSource`      | Prepares a document source for storage in the vector store by removing/serializing certain fields.            |
| addDocumentsToWeaviate                 | `allDocumentSourcesWithChunks: PsRagDocumentSource[]`                                                        | `Promise<void>`            | Uploads documents and their chunks to the Weaviate vector store, handling cross-references and deduplication. |
| countDuplicateUrls                     | `data: any[]`                                                                                                | `Promise<number>`          | Counts duplicate URLs in a list of document metadata.                                                         |
| classifyDocuments                      | `allDocumentSourcesWithChunks: PsRagDocumentSource[]`                                                        | `Promise<void>`            | Classifies, ranks, and rates documents by relevance, substance, and category.                                 |
| processSource                          | `source: PsRagDocumentSource`                                                                                | `Promise<void>`            | Processes a single document source (stub for extension).                                                      |
| processFiles                           | `files: string[]`                                                                                            | `Promise<void>`            | Processes a list of files: parses, analyzes, cleans, chunks, and ranks them.                                  |
| aggregateChunkData                     | `chunks: LlmDocumentChunksStrategy[]`                                                                        | `string`                   | Aggregates chunk data recursively from a chunk tree.                                                          |
| createTreeChunks                       | `metadata: PsRagDocumentSource, cleanedUpData: string`                                                       | `Promise<void>`            | Splits a document into hierarchical chunks, analyzes, compresses, and stores them in metadata.                |
| processFilePartTree                    | `fileId: string, cleanedUpData: string, weaviateDocumentId: string`                                          | `Promise<void>`            | Processes a cleaned document part: chunks, ranks, and updates metadata.                                       |
| rankChunks                             | `metadata: PsRagDocumentSource`                                                                              | `Promise<void>`            | Ranks document chunks by relevance, substance, and quality.                                                   |
| extractFileIdFromPath                  | `filePath: string`                                                                                           | `string \| null`           | Extracts fileId from a file path using metadata.                                                              |
| getFilesForProcessing                  | `forceProcessing?: boolean`                                                                                   | `string[]`                 | Returns a list of files that need processing, based on metadata changes.                                      |
| getAllFilesForProcessing               | none                                                                                                         | `string[]`                 | Returns all file paths from metadata.                                                                         |
| getMetaDataForAllFiles                 | none                                                                                                         | `PsRagDocumentSource[]`    | Returns all document metadata objects.                                                                        |
| updateCachedFilesAndMetadata           | `relativePath: string, url: string, data: Buffer \| string, contentType: string, lastModifiedOnServer: string`| `void`                     | Updates file metadata after caching a file.                                                                   |
| readDataLayout                         | none                                                                                                         | `Promise<PsIngestionDataLayout>` | Loads the data layout from a file or URL.                                                              |
| getFileNameAndPath                     | `url: string, extension: string`                                                                             | `{ fullPath: string; relativePath: string }` | Computes a unique file path for a URL and extension.                                      |
| downloadAndCache                       | `urls: string[], isJsonData: boolean, browserPage: Page`                                                     | `Promise<void>`            | Downloads and caches files from URLs, updating metadata.                                                      |
| determineExtension                     | `contentType: string, isJsonData: boolean`                                                                   | `string`                   | Determines file extension from content type.                                                                  |
| processJsonUrls                        | `urls: string[], browserPage: Page`                                                                          | `Promise<void>`            | Downloads and caches content from URLs found in JSON files.                                                   |
| loadFileMetadata                       | none                                                                                                         | `Promise<void>`            | Loads file metadata from disk, or initializes if not found.                                                   |
| saveFileMetadata                       | none                                                                                                         | `Promise<void>`            | Saves file metadata to disk.                                                                                  |

---

## Example

```typescript
import { IngestionAgentProcessor } from '@policysynth/agents/rag/ingestion/processor.js';

class MyCustomIngestionProcessor extends IngestionAgentProcessor {
  // Optionally override methods for custom behavior
}

(async () => {
  const processor = new MyCustomIngestionProcessor(
    "https://content.thegovlab.com/flows/trigger/a84e387c-9a82-4bb2-b41f-22780c3826a7"
  );
  await processor.processDataLayout();
})();
```

---

## Key Concepts

- **Data Layout**: Describes which documents and JSON sources to ingest, their categories, and project context.
- **File Metadata**: Tracks file download status, hashes, last modified dates, and chunking/ranking results.
- **Chunking**: Documents are split into hierarchical chunks for fine-grained analysis and retrieval.
- **Analysis & Ranking**: Each document and chunk is analyzed (summarized, categorized, compressed) and ranked by relevance, substance, and quality.
- **Vector Store Integration**: Documents and chunks are uploaded to a vector database (e.g., Weaviate) with cross-references for semantic search.
- **Caching**: Downloads and processing are cached to avoid redundant work and speed up re-ingestion.

---

## Types Used

- `PsIngestionDataLayout`: Describes the ingestion plan (document URLs, categories, project description).
- `PsRagDocumentSource`: Metadata and content for a single document.
- `PsRagChunk`: Metadata and content for a single chunk of a document.
- `LlmDocumentChunksStrategy`: Structure for hierarchical chunking of documents.

---

## Extending

To use this processor, extend it and implement/override methods as needed for your specific ingestion workflow. The processor is designed to be modular and composable with various agent classes for analysis, chunking, and ranking.

---

## See Also

- `DocumentCleanupAgent`
- `DocumentTreeSplitAgent`
- `IngestionChunkCompressorAgent`
- `DocumentAnalyzerAgent`
- `IngestionChunkAnalzyerAgent`
- `IngestionChunkRanker`
- `IngestionDocumentRanker`
- `DocumentClassifierAgent`
- `PsRagDocumentVectorStore`
- `PsRagChunkVectorStore`

---

**Note:** This class is abstract and not intended to be instantiated directly. Extend it to implement a concrete ingestion pipeline.