interface CpsBootResponse {
  currentMemory: IEngineInnovationMemoryData;
  configuration: any; //TODO: Add types for this
  isAdmin: boolean;
  name: string;
}