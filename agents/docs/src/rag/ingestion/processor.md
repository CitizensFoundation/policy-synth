# IngestionAgentProcessor

This class is responsible for processing and managing the ingestion of documents, including downloading, caching, analyzing, and storing document data. It extends the `BaseIngestionAgent` class.

## Properties

| Name                | Type                                  | Description                                       |
|---------------------|---------------------------------------|---------------------------------------------------|
| dataLayoutPath      | string                                | URL or path to the data layout configuration.     |
| cachedFiles         | string[]                              | List of cached file paths.                        |
| fileMetadataPath    | string                                | Path to the file metadata JSON file.              |
| fileMetadata        | Record<string, any>                   | Metadata for each file processed.                 |
| initialFileMetadata | Record<string, any>                   | Initial state of file metadata for comparison.    |
| cleanupAgent        | DocumentCleanupAgent                  | Agent for cleaning document data.                 |
| splitAgent          | DocumentTreeSplitAgent                | Agent for splitting documents into tree structures. |
| chunkCompressor     | IngestionChunkCompressorAgent         | Agent for compressing document chunks.           |
| chunkAnalysisAgent  | IngestionChunkAnalzyerAgent           | Agent for analyzing document chunks.              |
| docAnalysisAgent    | DocumentAnalyzerAgent                 | Agent for analyzing entire documents.             |
| dataLayout          | PsIngestionDataLayout                 | Data layout configuration loaded from the path.   |

## Methods

| Name                         | Parameters                          | Return Type | Description                                       |
|------------------------------|-------------------------------------|-------------|---------------------------------------------------|
| processDataLayout            |                                     | Promise<void> | Processes the data layout for document ingestion. |
| processAllSources            | allDocumentSources: PsRagDocumentSource[] | Promise<void> | Processes all document sources with chunks.       |
| stringifyIfObjectOrArray     | value: any                          | string      | Converts objects or arrays to JSON string.        |
| transformChunkForVectorstore | chunk: PsRagChunk                   | PsRagChunk  | Transforms a chunk for storage in vector store.   |
| transformDocumentSourceForVectorstore | source: PsRagDocumentSource | PsRagDocumentSource | Transforms a document source for vector store.    |
| addDocumentsToWeaviate       | allDocumentSourcesWithChunks: PsRagDocumentSource[] | Promise<void> | Adds documents and their chunks to Weaviate.      |
| countDuplicateUrls           | data: any[]                         | Promise<number> | Counts duplicate URLs in the data.                |
| classifyDocuments            | allDocumentSourcesWithChunks: PsRagDocumentSource[] | Promise<void> | Classifies all documents based on chunks.         |
| processSource                | source: PsRagDocumentSource         | Promise<void> | Processes a single document source.               |
| processFiles                 | files: string[]                     | Promise<void> | Processes multiple files for ingestion.           |
| aggregateChunkData           | chunks: LlmDocumentChunksStrategy[] | string      | Aggregates data from document chunks.             |
| createTreeChunks             | metadata: PsRagDocumentSource, cleanedUpData: string | Promise<void> | Creates tree chunks from document data.           |
| processFilePartTree          | fileId: string, cleanedUpData: string, weaviateDocumentId: string | Promise<void> | Processes a part of a file as a tree.             |
| rankChunks                   | metadata: PsRagDocumentSource       | Promise<void> | Ranks chunks within a document.                   |
| extractFileIdFromPath        | filePath: string                    | string \| null | Extracts a file ID from a file path.              |
| getFilesForProcessing        | forceProcessing: boolean = false    | string[]    | Gets a list of files that need processing.        |
| getAllFilesForProcessing     |                                     | string[]    | Gets a list of all files for processing.          |
| getMetaDataForAllFiles       |                                     | PsRagDocumentSource[] | Gets metadata for all files.                      |
| updateCachedFilesAndMetadata | relativePath: string, url: string, data: Buffer \| string, contentType: string, lastModifiedOnServer: string | void        | Updates cached files and their metadata.          |
| readDataLayout               |                                     | Promise<PsIngestionDataLayout> | Reads the data layout from the specified path.   |
| getFileNameAndPath           | url: string, extension: string      | { fullPath: string; relativePath: string } | Gets the full and relative paths for a file.      |
| downloadAndCache             | urls: string[], isJsonData: boolean, browserPage: Page | Promise<void> | Downloads and caches content from URLs.           |
| determineExtension           | contentType: string, isJsonData: boolean | string   | Determines the file extension based on content type. |
| processJsonUrls              | urls: string[], browserPage: Page   | Promise<void> | Processes JSON URLs for downloading and caching.  |
| loadFileMetadata             |                                     | Promise<void> | Loads file metadata from a JSON file.             |
| saveFileMetadata             |                                     | Promise<void> | Saves the current file metadata to a JSON file.   |

## Example

```typescript
import { IngestionAgentProcessor } from '@policysynth/agents/rag/ingestion/processor.js';

const processor = new IngestionAgentProcessor();
processor.processDataLayout().then(() => {
  console.log("Data layout processed successfully.");
}).catch((error) => {
  console.error("Failed to process data layout:", error);
});
```