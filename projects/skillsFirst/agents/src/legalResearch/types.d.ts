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
