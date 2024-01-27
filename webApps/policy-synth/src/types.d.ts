interface CpsBootResponse {
  currentMemory: PsBaseMemoryData;
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