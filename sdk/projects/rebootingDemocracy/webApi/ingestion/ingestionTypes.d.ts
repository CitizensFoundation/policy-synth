
interface DataLayout {
  jsonUrls: string[];
  documentUrls: string[];
}

// Add cache for first the response keyed on the data hashes
// So if user asks a similar question, we lookup in weaviate, and decide in the routing
interface CachedFileMetadata {
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
  title?: string;
  filePath: string;
  contentType: string;
  chunks?: { [key: number]: PsIngestionChunkData };
  references: string[];
  allUrls: string[];
  documentMetaData: { [key: string]: string };
}

interface LlmDocumentAnalysisReponse {
  title: string;
  shortDescription: string;
  description: string;
  fullDescriptionOfAllContents: string;
  references: string[];
  allUrls: string[];
  documentMetaData: { [key: string]: string };
}

interface LlmChunkCompressionReponse {
  title: string;
  shortDescription: string;
  completeCompressedContents: string;
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
}

interface LlmChunkAnalysisReponse {
  title: string;
  shortSummary: string;
  fullCompressedContents: string;
  metaDataFields: string[];
  metaData: { [key: string]: string };
}

interface PsIngestionChunkData {
  title: string;
  chunkIndex: number;
  documentIndex?: string;
  mainExternalUrlFound: string;
  shortSummary: string;
  uncompressedContent: string;
  compressedContents: string;
  importantContextChunkIndexes: number[];
  metaDataFields?: string[];
  metaData: { [key: string]: string };
}
