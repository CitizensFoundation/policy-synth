interface EducationRequirementResearchResult extends PsEloRateable {
  titleCode: string;
  jobTitle: string;
  sourceUrl: string;
  reasoning: string;
  title?: string;
  statedDegreeRequirement: string;
  degreeRequirementType: "Associate's degree" | "Bachelor's degree" | "Master's degree" | "Doctoral degree" | "Other";
  typeOfOfficialDocument: "regulation" | "statute" | "classification" | "policy" | "courtDecision" | "administrativeDecision" | "jobPosting" | "other";
  matchTypeForJobTitle: "exact" | "partial";
  error?: string;
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
