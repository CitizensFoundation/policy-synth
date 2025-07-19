interface EducationRequirementResearchResult extends PsEloRateable {
  jobTitle: string;
  sourceUrl: string;
  reasoning: string;
  statedDegreeRequirement: string;
  confidenceScore?: number;
  error?: string;
}

interface EducationRequirementResearchRow {
  jobTitle: string;
  analysisResults?: EducationRequirementResearchResult[];
}

interface StatuteChunkAnalysis {
  title: string;
  chunkIndex: number;
  text: string;
  discussesJobs: boolean;
  summary: string;
}

interface JobStatuteMatchResult {
  jobTitle: string;
  title: string;
  chunkIndex: number;
  mentionsJob: boolean;
  reasoning: string;
}

interface StatuteResearchMemory {
  chunks: StatuteChunkAnalysis[];
  jobMatches: { [jobTitle: string]: JobStatuteMatchResult[] };
}
interface ExtractedJobTitleInformation {
  title: string;
  chunkIndex: number;
  extractedJobTitleDegreeInformation: string[];
}
