
interface DataLayout {
  jsonUrls: string[];
  documentUrls: string[];
}

// Add cache for first the response keyed on the data hashes
// So if user asks a similar question, we lookup in weaviate, and decide in the routing
interface DocumentSource extends PsEloRateable {
  key: string;
  url: string;
  lastModified: string;
  lastModifiedOnServer: string;
  size: number;
  hash: string;
  fileId: string;
  cleanedDocument?: string;
  description?: string;
  shortDescription?: string;
  fullDescriptionOfAllContents?: string;
  compressedFullDescriptionOfAllContents?: string;
  title?: string;
  weaviteId?: string;
  cachedChunkStrategy?: LlmDocumentChunksStrategy[];
  filePath: string;
  contentType: string;
  chunks?: PsIngestionChunkData[];
  allReferencesWithUrls: string[];
  allOtherReferences: string[];
  allImageUrls: string[];
  documentDate: string;
  documentMetaData: { [key: string]: string };
}

interface LlmDocumentAnalysisReponse {
  title: string;
  shortDescription: string;
  description: string;
  fullDescriptionOfAllContents: string;
  compressedFullDescriptionOfAllContents?: string;
  allReferencesWithUrls: string[];
  allImageUrls: string[];
  allOtherReferences: string[];
  documentDate: string;
  documentMetaData: { [key: string]: string };
}

interface LlmChunkAnalysisReponse {
  title: string;
  shortDescription: string;
  fullDescription: string;
  mainExternalUrlFound: string;
  textMetaData: { [key: string]: string };
}

interface LlmDocumentChunksStrategy {
  chapterIndex: number;
  chapterTitle: string;
  chapterType: 'full' | 'subChapter';
  chapterStartLineNumber: number;
  importantContextChapterIndexes: number[];
  chunkData?: string;
  startLine: number;
  actualStartLine?: number;
  actualEndLine?: number;
  subChunks?: Chunk[];
}

interface LlmChunkAnalysisReponse {
  title: string;
  shortSummary: string;
  fullCompressedContent: string;
  metaDataFields: string[];
  metaData: { [key: string]: string };
}

interface PsIngestionChunkData extends PsEloRateable {
  title: string;
  chunkIndex: number;
  documentIndex?: string;
  mainExternalUrlFound: string;
  data?: string;
  actualStartLine?: number;
  startLine?: number;
  actualEndLine?: number;
  shortSummary: string;
  fullSummary: string;
  uncompressedContent: string;
  compressedContent: string;
  subChunks?: PsIngestionChunkData[];
  importantContextChunkIndexes: number[];
  metaDataFields?: string[];
  metaData: { [key: string]: string };
}
