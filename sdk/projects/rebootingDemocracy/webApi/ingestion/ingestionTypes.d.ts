
interface DataLayout {
  jsonUrls: string[];
  documentUrls: string[];
}

interface ChunkData {
  title: string;
  shortSummary: string;
  fullSummary: string;
  isValid: boolean;
  metaData: { [key: string]: string };
  fullText: string;
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
  chunks?: { [key: string]: ChunkData };
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
  fullCompressedContents: string;
  textMetaData: { [key: string]: string };
}

interface LlmDocumentChunksStrategyReponse {
  sectionIndex: number;
  sectionTitle: string;
  sectionStartLineNumber: number;
  directlyConnectedSectionIndexes: number[];
}

interface LlmDocumentChunksIdentificationResponse {
  oneLineTextIndexesForSplittingDocument: string[];
}

interface LlmChunkAnalysisReponse {
  title: string;
  shortSummary: string;
  fullSummary: string;
  metaDataFields: string[];
  metaData: { [key: string]: string };
}

interface LlmChunkFullSummaryValidationReponse {
  fullSummaryContainsAllDataFromChunk: boolean;
}