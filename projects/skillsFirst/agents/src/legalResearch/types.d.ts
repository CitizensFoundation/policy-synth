export interface EducationRequirementResearchResult extends PsEloRateable {
  jobTitle: string;
  sourceUrl: string;
  requirementSummary: string;
  reasoning: string;
  confidenceScore: number;
  error?: string;
}

export interface EducationRequirementResearchRow {
  jobTitle: string;
  analysisResults?: EducationRequirementResearchResult[];
}

export interface StatuteChunkAnalysis {
  title: string;
  chunkIndex: number;
  text: string;
  discussesJobs: boolean;
  summary: string;
}

export interface JobStatuteMatchResult {
  jobTitle: string;
  title: string;
  chunkIndex: number;
  mentionsJob: boolean;
  reasoning: string;
}

export interface StatuteResearchMemory {
  chunks: StatuteChunkAnalysis[];
  jobMatches: { [jobTitle: string]: JobStatuteMatchResult[] };
}
