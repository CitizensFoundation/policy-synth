interface CpsBootResponse {
  currentMemory: IEngineInnovationMemoryData;
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