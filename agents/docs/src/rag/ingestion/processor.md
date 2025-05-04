# IngestionAgentProcessor

The `IngestionAgentProcessor` is an abstract class for orchestrating the ingestion, processing, analysis, chunking, ranking, and storage of external documents and data sources for RAG (Retrieval-Augmented Generation) pipelines. It handles downloading, caching, metadata management, chunking, analysis, and vector store integration for documents and their hierarchical chunks.

**File:** `@policysynth/agents/rag/ingestion/processor.js`

## Properties

| Name                  | Type                                         | Description                                                                                  |
|-----------------------|----------------------------------------------|----------------------------------------------------------------------------------------------|
| dataLayoutPath        | `string`                                     | Path or URL to the data layout JSON describing sources to ingest.                            |
| cachedFiles           | `string[]`                                   | List of cached file paths.                                                                   |
| fileMetadataPath      | `string`                                     | Path to the file metadata JSON cache.                                                        |
| fileMetadata          | `Record<string, any>`                        | Metadata for all processed files, keyed by fileId.                                           |
| initialFileMetadata   | `Record<string, any>`                        | Deep copy of file metadata at the start of processing, for change detection.                 |
| cleanupAgent          | `DocumentCleanupAgent`                       | Agent for cleaning up document text.                                                         |
| splitAgent            | `DocumentTreeSplitAgent`                     | Agent for splitting documents into hierarchical chunks.                                      |
| chunkCompressor       | `IngestionChunkCompressorAgent`              | Agent for compressing chunk data.                                                            |
| chunkAnalysisAgent    | `IngestionChunkAnalzyerAgent`                | Agent for analyzing document chunks.                                                         |
| docAnalysisAgent      | `DocumentAnalyzerAgent`                      | Agent for analyzing full documents.                                                          |
| dataLayout            | `PsIngestionDataLayout`                      | The loaded data layout object describing sources and categories.                             |

## Methods

| Name                                   | Parameters                                                                                                    | Return Type                | Description                                                                                                 |
|---------------------------------------- |---------------------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| constructor                            | `dataLayoutPath?: string`                                                                                     | `void`                     | Initializes the processor, loads metadata, and instantiates agents.                                         |
| processDataLayout                      | none                                                                                                          | `Promise<void>`            | Main entry point: loads data layout, downloads/caches files, processes files, and ingests to vector store.  |
| processAllSources                      | `allDocumentSources: PsRagDocumentSource[]`                                                                   | `Promise<void>`            | Processes all document sources with chunks and adds them to the vector store.                               |
| stringifyIfObjectOrArray               | `value: any`                                                                                                  | `string`                   | Converts objects/arrays to JSON strings for storage.                                                        |
| transformChunkForVectorstore           | `chunk: PsRagChunk`                                                                                           | `any`                      | Prepares a chunk for storage in the vector store (removes heavy fields, stringifies metadata).              |
| transformDocumentSourceForVectorstore  | `source: PsRagDocumentSource`                                                                                 | `any`                      | Prepares a document source for storage in the vector store.                                                 |
| addDocumentsToWeaviate                 | `allDocumentSourcesWithChunks: PsRagDocumentSource[]`                                                         | `Promise<void>`            | Adds documents and their chunks (with cross-references) to the Weaviate vector store.                       |
| countDuplicateUrls                     | `data: any[]`                                                                                                 | `Promise<number>`          | Counts duplicate URLs in a set of document metadata.                                                        |
| classifyDocuments                      | `allDocumentSourcesWithChunks: PsRagDocumentSource[]`                                                         | `Promise<void>`            | Classifies and ranks documents by relevance, substance, and by category.                                    |
| processSource                          | `source: PsRagDocumentSource`                                                                                 | `Promise<void>`            | Processes a single document source (analysis, ranking, etc).                                                |
| processFiles                           | `files: string[]`                                                                                             | `Promise<void>`            | Processes a list of files: parses, analyzes, cleans, splits, and chunks them.                               |
| aggregateChunkData                     | `chunks: LlmDocumentChunksStrategy[]`                                                                         | `string`                   | Aggregates chunk data recursively from a chunk tree.                                                        |
| createTreeChunks                       | `metadata: PsRagDocumentSource, cleanedUpData: string`                                                        | `Promise<void>`            | Splits a document into hierarchical chunks, analyzes, compresses, and stores them in metadata.              |
| processFilePartTree                    | `fileId: string, cleanedUpData: string, weaviateDocumentId: string`                                           | `Promise<void>`            | Processes a cleaned document part: splits, chunks, ranks, and updates metadata.                             |
| rankChunks                             | `metadata: PsRagDocumentSource`                                                                               | `Promise<void>`            | Ranks all chunks in a document by relevance, substance, and quality.                                        |
| extractFileIdFromPath                  | `filePath: string`                                                                                            | `string \| null`           | Extracts a fileId from a file path using metadata.                                                          |
| getFilesForProcessing                  | `forceProcessing?: boolean`                                                                                   | `string[]`                 | Returns a list of files that need processing (new or changed).                                              |
| getAllFilesForProcessing               | none                                                                                                          | `string[]`                 | Returns all files known in metadata.                                                                        |
| getMetaDataForAllFiles                 | none                                                                                                          | `PsRagDocumentSource[]`    | Returns all file metadata as document sources.                                                              |
| updateCachedFilesAndMetadata           | `relativePath: string, url: string, data: Buffer \| string, contentType: string, lastModifiedOnServer: string`| `void`                     | Updates file metadata after caching a file.                                                                 |
| readDataLayout                         | none                                                                                                          | `Promise<PsIngestionDataLayout>` | Loads the data layout from a file or URL.                                                            |
| getFileNameAndPath                     | `url: string, extension: string`                                                                              | `{ fullPath: string; relativePath: string }` | Computes a unique file path for a URL and extension.                                      |
| downloadAndCache                       | `urls: string[], isJsonData: boolean, browserPage: Page`                                                      | `Promise<void>`            | Downloads and caches files from URLs, updating metadata.                                                    |
| determineExtension                     | `contentType: string, isJsonData: boolean`                                                                    | `string`                   | Determines file extension from content type.                                                                |
| processJsonUrls                        | `urls: string[], browserPage: Page`                                                                           | `Promise<void>`            | Processes JSON URLs, downloads referenced content, and caches it.                                           |
| loadFileMetadata                       | none                                                                                                          | `Promise<void>`            | Loads file metadata from disk, or initializes if not present.                                               |
| saveFileMetadata                       | none                                                                                                          | `Promise<void>`            | Saves file metadata to disk.                                                                                |

## Example

```typescript
import { IngestionAgentProcessor } from '@policysynth/agents/rag/ingestion/processor.js';

class MyIngestionProcessor extends IngestionAgentProcessor {
  // Implement any abstract methods or extend as needed
}

(async () => {
  const processor = new MyIngestionProcessor(
    "https://content.thegovlab.com/flows/trigger/a84e387c-9a82-4bb2-b41f-22780c3826a7"
  );
  await processor.processDataLayout();
})();
```

## Usage Notes

- **Extending:** This class is abstract; you must extend it to use.
- **Agents:** Relies on several agent classes for document cleaning, splitting, analysis, and ranking.
- **Vector Store:** Integrates with Weaviate via `PsRagDocumentVectorStore` and `PsRagChunkVectorStore`.
- **Metadata:** Maintains a JSON file for file metadata, used for change detection and incremental processing.
- **Chunking:** Supports hierarchical chunking and cross-referencing between chunks and documents.
- **Browser Automation:** Uses Puppeteer (with StealthPlugin) for robust web content fetching.
- **Error Handling:** Logs and skips files with errors, continues processing others.

---

**See also:**  
- `PsRagDocumentSource`, `PsRagChunk`, `LlmDocumentChunksStrategy`, `PsIngestionDataLayout` for data structures used throughout the processor.  
- Agent classes such as `DocumentCleanupAgent`, `DocumentTreeSplitAgent`, etc., for the processing pipeline.