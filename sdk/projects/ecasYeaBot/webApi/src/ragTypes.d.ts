interface PsEcasYeaRagChunk extends PsEloRateable {
  id?: string;
  question: string;
  answer: string;
  isEuWideOrCountrySpecific?: "euWide" | "countrySpecific" | "unknown";
  _additional?: { id: string; distance: number; certainty: number };
}

interface PsEcasYeaRagChunkAnalysis {
  isEuWideOrCountrySpecific?: "euWide" | "countrySpecific" | "unknown";
}


interface PsEcasRagChunkGraphQlResponse {
  data: {
    Get: {
      EcasYeaRagDocumentChunk: PsEcasYeaRagChunk[];
    };
  };
}

interface PsIngestionDataLayout {
  jsonUrls: string[];
  documentUrls: string[];
  categories: string[];
  aboutProject: string;
}

interface PsRagDocumentClassificationResponse {
  primaryCategory: string;
  secondaryCategory: string;
}

interface PsRagRoutingResponse {
  primaryCategory: string;
  secondaryCategories: string[];
  userIsAskingForLatestContent: boolean;
  isAskingAboutOneSpecificDetail: string;
  isAskingAboutOneSpecificProject: string;
  rewrittenUserQuestionVectorDatabaseSearch: string;
}

// Add cache for first the response keyed on the data hashes
// So if user asks a similar question, we lookup in weaviate, and decide in the routing
interface PsRagDocumentSource extends PsEloRateable {
  id?: string;
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
  cachedChunkStrategy?: LlmDocumentChunksStrategy[];
  filePath: string;
  contentType: string;
  chunks?: PsRagChunk[];
  allReferencesWithUrls: string[];
  allOtherReferences: string[];
  allImageUrls: string[];
  documentDate: string;
  relevanceEloRating?: number;
  substanceEloRating?: number;
  primaryCategory?: string;
  secondaryCategory?: string;
  documentMetaData: { [key: string]: string };
}

interface PsSimpleDocumentSource {
  id: string;
  url: string;
  description?: string;
  shortDescription?: string;
  compressedFullDescriptionOfAllContents?: string;
  title?: string;
  contentType: string;
  allReferencesWithUrls: string[];
  allOtherReferences: string[];
  allImageUrls: string[];
  documentDate: string;
  relevanceEloRating?: number;
  substanceEloRating?: number;
  primaryCategory?: string;
  secondaryCategory?: string;
  documentMetaData: { [key: string]: string };
}

interface PsVectorSearchResponse {
  responseText: string;
  documents: PsSimpleDocumentSource[];
}

interface PsRagDocumentSourceGraphQlResponse {
  data: {
    Get: {
      RagDocument: PsRagDocumentSource[];
    };
  };
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
  chapterType: "full" | "subChapter";
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

interface PsRagChunk extends PsEloRateable {
  id?: string;
  title: string;
  chunkIndex: number;
  chapterIndex: number;
  mainExternalUrlFound: string;
  data?: string;
  actualStartLine?: number;
  startLine?: number;
  actualEndLine?: number;
  shortSummary: string;
  fullSummary: string;
  relevanceEloRating?: number;
  qualityEloRating?: number;
  substanceEloRating?: number;
  uncompressedContent: string;
  compressedContent: string;
  mostRelevantSiblingChunks?: PsRagChunk[];
  allSiblingChunks?: PsRagChunk[];
  inChunk?: PsRagChunk[];
  inDocument?: PsRagDocumentSource[];
  subChunks?: PsRagChunk[];
  importantContextChunkIndexes: number[];
  metaDataFields?: string[];
  metaData: { [key: string]: string };
  _additional?: { id: string; distance: number; certainty: number };
}

interface PsRagChunkGraphQlResponse {
  data: {
    Get: {
      RagChunk: PsRagChunk[];
    };
  };
}
