
interface JobDescription {
  name: string;
  text: string;
  classification: string;
  url?: string;
  analysis: JobDescriptionAnalysis;
}

interface JobDescriptionAnalysis {
  needsCollegeDegree: boolean;
  educationRequirements: JobEducationRequirementTypes[];
}

type JobEducationRequirementTypes =
  | "highschool"
  | "collegeCourseworkDescriptions"
  | "associatesDegreeDescriptions"
  | "bachelorsDegreeDescriptions"
  | "mastersDegreeDescriptions"
  | "doctoralDegreeDescriptions";

interface JobDescriptionMemoryData extends PsAgentMemoryData {
  jobDescriptions: JobDescription[];
}
