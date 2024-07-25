# IngestionAgentAgent

The `IngestionAgentAgent` class is an abstract class that extends the `BaseIngestionAgent` class. It is responsible for processing and managing the ingestion of documents, including downloading, caching, cleaning, analyzing, and ranking document chunks. This class utilizes various agents to perform specific tasks such as document cleanup, chunk compression, and document analysis.

## Properties

| Name                    | Type                              | Description                                                                 |
|-------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| dataLayoutPath          | string                            | Path to the data layout file or URL.                                        |
| cachedFiles             | string[]                          | Array of cached file paths.                                                 |
| fileMetadataPath        | string                            | Path to the file metadata JSON file.                                        |
| fileMetadata            | Record<string, any>               | Object containing metadata for each file.                                   |
| initialFileMetadata     | Record<string, any>               | Deep copy of the initial state of file metadata for comparison.             |
| cleanupAgent            | DocumentCleanupAgent              | Instance of the `DocumentCleanupAgent` class.                               |
| splitAgent              | DocumentTreeSplitAgent            | Instance of the `DocumentTreeSplitAgent` class.                             |
| chunkCompressor         | IngestionChunkCompressorAgent     | Instance of the `IngestionChunkCompressorAgent` class.                      |
| chunkAnalysisAgent      | IngestionChunkAnalzyerAgent       | Instance of the `IngestionChunkAnalzyerAgent` class.                        |
| docAnalysisAgent        | DocumentAnalyzerAgent             | Instance of the `DocumentAnalyzerAgent` class.                              |
| dataLayout              | PsIngestionDataLayout             | Data layout object containing URLs and categories for ingestion.            |

## Methods

| Name                          | Parameters                                                                 | Return Type          | Description                                                                                     |
|-------------------------------|----------------------------------------------------------------------------|----------------------|-------------------------------------------------------------------------------------------------|
| constructor                   | dataLayoutPath: string = "https://content.thegovlab.com/flows/trigger/a84e387c-9a82-4bb2-b41f-22780c3826a7" | void                 | Initializes the `IngestionAgentAgent` class with the specified data layout path.                |
| processDataLayout             | none                                                                       | Promise<void>        | Processes the data layout, downloads and caches content, and processes files.                   |
| processAllSources             | allDocumentSources: PsRagDocumentSource[]                                  | Promise<void>        | Processes all document sources and adds them to the vector store.                               |
| stringifyIfObjectOrArray      | value: any                                                                 | string               | Converts an object or array to a JSON string, otherwise returns the value as is.                |
| transformChunkForVectorstore  | chunk: PsRagChunk                                                          | any                  | Transforms a chunk for storage in the vector store.                                             |
| transformDocumentSourceForVectorstore | source: PsRagDocumentSource                                        | any                  | Transforms a document source for storage in the vector store.                                   |
| addDocumentsToWeaviate        | allDocumentSourcesWithChunks: PsRagDocumentSource[]                        | Promise<void>        | Adds documents and their chunks to the Weaviate vector store.                                   |
| countDuplicateUrls            | data: any[]                                                                | Promise<number>      | Counts the number of duplicate URLs in the provided data.                                       |
| classifyDocuments             | allDocumentSourcesWithChunks: PsRagDocumentSource[]                        | Promise<void>        | Classifies and ranks documents based on relevance and substance.                                |
| processSource                 | source: PsRagDocumentSource                                                | Promise<void>        | Processes a single document source.                                                             |
| processFiles                  | files: string[]                                                            | Promise<void>        | Processes the specified files, including parsing, cleaning, and chunking.                       |
| aggregateChunkData            | chunks: LlmDocumentChunksStrategy[]                                        | string               | Aggregates data from chunks and their sub-chunks.                                               |
| createTreeChunks              | metadata: PsRagDocumentSource, cleanedUpData: string                       | Promise<void>        | Creates tree chunks for the specified metadata and cleaned-up data.                             |
| processFilePartTree           | fileId: string, cleanedUpData: string, weaviateDocumentId: string          | Promise<void>        | Processes a part of a file, including chunking and ranking.                                     |
| rankChunks                    | metadata: PsRagDocumentSource                                              | Promise<void>        | Ranks chunks based on relevance, substance, and quality.                                        |
| extractFileIdFromPath         | filePath: string                                                           | string \| null       | Extracts the file ID from the specified file path.                                              |
| getFilesForProcessing         | forceProcessing: boolean = false                                           | string[]             | Returns a list of files that need to be processed.                                              |
| getAllFilesForProcessing      | none                                                                       | string[]             | Returns a list of all files that need to be processed.                                          |
| getMetaDataForAllFiles        | none                                                                       | PsRagDocumentSource[]| Returns metadata for all files.                                                                 |
| updateCachedFilesAndMetadata  | relativePath: string, url: string, data: Buffer \| string, contentType: string, lastModifiedOnServer: string | void                 | Updates cached files and metadata.                                                              |
| readDataLayout                | none                                                                       | Promise<PsIngestionDataLayout> | Reads the data layout from the specified path or URL.                                           |
| getFileNameAndPath            | url: string, extension: string                                             | { fullPath: string; relativePath: string } | Returns the file name and path for the specified URL and extension.                             |
| downloadAndCache              | urls: string[], isJsonData: boolean, browserPage: Page                     | Promise<void>        | Downloads and caches content from the specified URLs.                                           |
| determineExtension            | contentType: string, isJsonData: boolean                                   | string               | Determines the file extension based on the content type.                                        |
| processJsonUrls               | urls: string[], browserPage: Page                                          | Promise<void>        | Processes JSON URLs and caches the content.                                                     |
| loadFileMetadata              | none                                                                       | Promise<void>        | Loads file metadata from the JSON file.                                                         |
| saveFileMetadata              | none                                                                       | Promise<void>        | Saves file metadata to the JSON file.                                                           |

## Example

```typescript
import { IngestionAgentAgent } from '@policysynth/agents/rag/ingestion/processor.js';

const agent = new IngestionAgentAgent();
agent.processDataLayout().then(() => {
  console.log("Data layout processed successfully.");
}).catch((err) => {
  console.error("Error processing data layout:", err);
});
```

This example demonstrates how to create an instance of the `IngestionAgentAgent` class and process the data layout. The `processDataLayout` method downloads and caches content, processes files, and adds documents to the vector store.