interface CpsBootResponse {
  currentMemory: PsSmarterCrowdsourcingMemoryData;
  configuration: any; //TODO: Add types for this
  isAdmin: boolean;
  name: string;
}

interface PsRoutingParams {
  projectId: number;
  subProblemIndex?: number;
  populationIndex?: number;
  solutionIndex?: number;
}

interface PsProjectData {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
}

//TODO: Remove when all is in ps/agents
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

interface PsRagDocumentSourcesWsData {
  name: string;
  message: PsSimpleDocumentSource[];
}
