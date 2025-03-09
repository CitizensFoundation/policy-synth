// Enum representing various levels of education types.
// Each member represents a specific education level, mapped to a string value.

// Extend the types to include readability analysis using EducationType

// Import the EducationType enum

// Interface defining additional information for each EducationType.
// This includes a code and an array of phrases associated with the education type.
interface EducationTypeInfo {
  code: string; // The code representing the education type, e.g., "EducationType.HighSchool".
  phrases: string[]; // An array of phrases that are associated with the education type.
}

/**
 * Represents a job description along with its analysis.
 */
interface JobDescription {
  titleCode: string;
  variant: string;
  classOfService: string;
  workWeek: string;
  bargainUnit: string;
  classCode: string;
  salaryRange: string;
  workMonth: string;
  deptCode: string;
  name: string; // The name of the job
  text: string; // The full text of the job description
  classification: import("./educationTypes.js").EducationType;
  url?: string;
  error?: string;
  processed?: boolean;
  multiLevelJob?: boolean;
  haveProcessedSubLevel?: boolean;
  cscRevised?: boolean;
  notes?: string;
  readabilityAnalysisTextTSNPM?: {
    fleschKincaidGrade: number;
  };
  occupationalCategory: OccupationalCategory;
  degreeAnalysis: JobDescriptionDegreeAnalysis;
  readabilityAnalysis?: JobDescriptionReadabilityAnalysis; // The readability analysis of the job description

  readingLevelGradeAnalysis?: {
    readabilityLevelExplanation: string;
    readabilityLevel: string;
    difficultPassages: string[];
  };
}
/**
 * Extends memory data to include job descriptions.
 */

interface JobDescriptionMemoryData extends PsAgentMemoryData {
  jobDescriptions: JobDescription[]; // Holds an array of job descriptions, from "interface JobDescriptionMemoryData extends PsAgentMemoryData { jobDescriptions: JobDescription[]; }"
  rewrittenJobDescriptions: JobDescription[];
  llmErrors: string[];
  doNotReprocessTitleCodes?: string[];
}

/**
 * Contains the analysis results of a job description.
 */
interface JobDescriptionDegreeAnalysis {
  needsCollegeDegree: boolean;
  // From the first set of questions: "Seeking to determine whether the job description includes a discussion of a college degree."

  educationRequirements: JobEducationRequirement[];
  // Lists the education requirements found, from "educationRequirements: JobEducationRequirement[];"

  maximumDegreeRequirement: import("./educationTypes.js").EducationType;

  includesMultipleJobLevelsWithDifferentEducationalRequirements: boolean;

  degreeRequirementStatus: DegreeRequirementStatus;
  // From the second set of questions: "Seeking to determine whether any college degree requirement is mandatory or permissive"

  mandatoryStatusExplanations: MandatoryStatusExplanations;
  // Explanations for scenarios in questions 2e and 2f, from "Review Agent: Review Each Type (String)...Explain why you reached the same conclusion..."

  degreePreferenceQuote?: string;
  // From question 2g: "Quote any language in the job description that suggests or states that a job applicant who has received a college or university degree would be more likely to be hired..."

  professionalLicenseRequirement?: ProfessionalLicenseRequirement;
  // Contains information about professional license requirements, from the third set of questions.

  barriersToNonDegreeApplicants?: string;
  // From the last question:
  // "Identify any barrier or obstacle stated, suggested, or described in the job description to hiring an applicant who does not have a college or university degree.
  // If there are no barriers, leave the field blank. Do not fabricate any information."
}

/**
 * Represents a specific education requirement found in a job description.
 */
interface JobEducationRequirement {
  type: import("./educationTypes.js").EducationType;
  // The type of education requirement, from "type: JobEducationRequirementTypes;"

  evidenceQuote: string;
  // The quoted language leading to the conclusion, from "For all job descriptions that produce 'True' except Type 1, quote the language that leads you to conclude that the correct answer is 'True.'"

  isMandatory: boolean;
  // Indicates if this requirement is mandatory, based on determinations from the second set of questions.
}

/**
 * Represents the mandatory or permissive status of a college degree requirement.
 */
interface DegreeRequirementStatus {
  isDegreeMandatory: boolean;
  // From question 2a: Determine if applicants can be hired only if they have obtained one of the degrees or credentials.

  hasAlternativeQualifications: boolean;
  // From question 2b: Determine if applicants can be hired if they satisfy alternatives not listed.

  alternativeQualifications?: string[];
  // Names of any alternative qualifications discovered, from "If there are alternatives you discover that are not listed, provide the name for it."

  multipleQualificationPaths: boolean;
  // From question 2c: Determine if applicants have two possible ways to qualify (degree or other qualifications).

  isDegreeAbsolutelyRequired: boolean;
  // From question 2d: Is a higher educational degree absolutely required for this job?

  substitutionPossible: boolean;
  // From question 2d: Could specific skills or other qualifications substitute for the degree?
}

/**
 * Contains explanations for specific scenarios regarding mandatory status determinations.
 */
interface MandatoryStatusExplanations {
  bothTrueExplanation?: string;
  // From question 2e: "Explain why you reached the same conclusion in response to both of these prompts" when both 2a and 2b are True.

  bothFalseExplanation?: string;
  // From question 2f: "Explain why you reached the same conclusion in response to both of these prompts" when both 2a and 2b are False.

  degreeRequirementExplanation?: string;
  // From question 2d: "Explain your judgment" regarding whether a higher educational degree is absolutely required.
}

/**
 * Enumeration of possible education requirement types.
 */
type JobEducationRequirementTypes =
  | "High school" // Type 1: "high school degree", "high school degree completion"
  | "Some college" // Type 2: "college coursework", "study at a college", "study at a university"
  | "Associate's degree" // Type 3: "associate's degree", "associate degree", etc.
  | "Bachelor's degree" // Type 4: "bachelor's degree", "bachelor degree", etc.
  | "mastersDegree" // Type 5: "master's degree", "master degree", etc.
  | "doctoralDegree"; // Type 6: "juris doctor", "doctor of philosophy", "Ph.D.", etc.

/**
 * Enumeration of classification types based on the Determination Steps.
 */
type JobDegreeClassification =
  | "High school" // "high school degree", "high school degree completion"
  | "Some college" // "college coursework", "study at a college", "study at a university"
  | "Associate's degree" // "associate's degree", etc.
  | "Bachelor's degree" // "bachelor's degree", etc.
  | "Master's degree" // "master's degree", etc.
  | "Doctoral degree"; // "doctoral degree", "Ph.D.", etc.



/**
 * Represents an occupational category.
 */
interface OccupationalCategory {
  id: string;
  mainCategory: string;
  descriptionMainCategory: string;
  subCategories: OccupationalSubCategory[];
}

interface OccupationalSubCategory {
  subCategory: string;
  descriptionSubCategory: string;
  link: string;
  id: string;
}

/**
 * Contains the analysis results of a job description.
 */
interface JobDescriptionDegreeAnalysis {
  needsCollegeDegree: boolean;
  // From the first set of questions: "Seeking to determine whether the job description includes a discussion of a college degree."

  educationRequirements: JobEducationRequirement[];
  // Lists the education requirements found, from "educationRequirements: JobEducationRequirement[];"

  degreeRequirementStatus: DegreeRequirementStatus;
  // From the second set of questions: "Seeking to determine whether any college degree requirement is mandatory or permissive"

  mandatoryStatusExplanations: MandatoryStatusExplanations;
  // Explanations for scenarios in questions 2e and 2f, from "Review Agent: Review Each Type (String)...Explain why you reached the same conclusion..."

  degreePreferenceQuote?: string;
  // From question 2g: "Quote any language in the job description that suggests or states that a job applicant who has received a college or university degree would be more likely to be hired..."

  professionalLicenseRequirement?: ProfessionalLicenseRequirement;
  // Contains information about professional license requirements, from the third set of questions.

  barriersToNonDegreeApplicants?: string;
  // From the last question:
  // "Identify any barrier or obstacle stated, suggested, or described in the job description to hiring an applicant who does not have a college or university degree.
  // If there are no barriers, leave the field blank. Do not fabricate any information."

  validationChecks?: DataConsistencyChecks;
  // Contains the results of data consistency checks based on predefined hypotheses.
}

/**
 * Represents a specific education requirement found in a job description.
 */
interface JobEducationRequirement {
  type: import("./educationTypes.js").EducationType;
  // The type of education requirement, from "type: JobEducationRequirementTypes;"

  evidenceQuote: string;
  // The quoted language leading to the conclusion, from "For all job descriptions that produce 'True' except Type 1, quote the language that leads you to conclude that the correct answer is 'True.'"

  isMandatory: boolean;
  // Indicates if this requirement is mandatory, based on determinations from the second set of questions.
}

/**
 * Represents the mandatory or permissive status of a college degree requirement.
 */
interface DegreeRequirementStatus {
  isDegreeMandatory: boolean;
  // From question 2a: Determine if applicants can be hired only if they have obtained one of the degrees or credentials.

  hasAlternativeQualifications: boolean;
  // From question 2b: Determine if applicants can be hired if they satisfy alternatives not listed.

  alternativeQualifications?: string[];
  // Names of any alternative qualifications discovered, from "If there are alternatives you discover that are not listed, provide the name for it."

  multipleQualificationPaths: boolean;
  // From question 2c: Determine if applicants have two possible ways to qualify (degree or other qualifications).

  isDegreeAbsolutelyRequired: boolean;
  // From question 2d: Is a higher educational degree absolutely required for this job?

  substitutionPossible: boolean;
  // From question 2d: Could specific skills or other qualifications substitute for the degree?
}

/**
 * Contains explanations for specific scenarios regarding mandatory status determinations.
 */
interface MandatoryStatusExplanations {
  bothTrueExplanation?: string;
  // From question 2e: "Explain why you reached the same conclusion in response to both of these prompts" when both 2a and 2b are True.

  bothFalseExplanation?: string;
  // From question 2f: "Explain why you reached the same conclusion in response to both of these prompts" when both 2a and 2b are False.

  degreeRequirementExplanation?: string;
  // From question 2d: "Explain your judgment" regarding whether a higher educational degree is absolutely required.
}

/**
 * Enumeration of possible education requirement types.
 */
type JobEducationRequirementTypes =
  | "High school" // Type 1: "high school degree", "high school degree completion"
  | "Some college" // Type 2: "college coursework", "study at a college", "study at a university"
  | "Associate's degree" // Type 3: "associate's degree", "associate degree", etc.
  | "Bachelor's degree" // Type 4: "bachelor's degree", "bachelor degree", etc.
  | "Master's degree" // Type 5: "master's degree", "master degree", etc.
  | "Doctoral degree"; // Type 6: "juris doctor", "doctor of philosophy", "Ph.D.", etc.

/**
 * Enumeration of classification types based on the Determination Steps.
 */
type JobDegreeClassification =
  | "High school" // "high school degree", "high school degree completion"
  | "Some college" // "college coursework", "study at a college", "study at a university"
  | "Associate's degree" // "associate's degree", etc.
  | "Bachelor's degree" // "bachelor's degree", etc.
  | "Master's degree" // "master's degree", etc.
  | "Doctoral degree"; // "doctoral degree", "Ph.D.", etc.

/**
 * Represents the requirement of a professional license for the job.
 */
interface ProfessionalLicenseRequirement {
  isLicenseRequired: boolean;
  // From question 4a: Determines if applicants can be hired only if they have obtained a professional license specified in the job description.

  licenseType?: string;

  licenseDescription?: string;
  // From question 4b: Quotes the language describing any professional license requirement in the job description.

  issuingAuthority?: string;
  // From question 4c: States the name of the entity that issues the professional license, if included or known based on expertise.

  includesDegreeRequirement?: boolean;
  // From question 4d: Determines if the professional license requirement includes a requirement to obtain one of the degrees or credentials listed in 1c, 1d, 1e, and 1f.
}

/**
 * Represents an occupational category.
 */
interface OccupationalCategory {
  id: string;
  mainCategory: string;
  descriptionMainCategory: string;
  subCategories: OccupationalSubCategory[];
}

interface OccupationalSubCategory {
  subCategory: string;
  descriptionSubCategory: string;
  link: string;
  id: string;
}

interface DataConsistencyChecks {
  cscRevisedConsistency?: string;
  // Checks if when cscRevised is true, then certain conditions are met:
  // If cscRevised is true, then degreeRequirementStatus.hasAlternativeQualifications and degreeRequirementStatus.multipleQualificationPaths should be true,
  // and degreeRequirementStatus.isDegreeMandatory and degreeRequirementStatus.isDegreeAbsolutelyRequired should be false.

  requiredAlternativeExplanationConsistency?: string;
  // Checks if both 'required' and 'alternative' are true, then mandatoryStatusExplanations.bothTrueExplanation should be filled.
  // If both are false, then mandatoryStatusExplanations.bothFalseExplanation should be filled.

  needsCollegeDegreeConsistency?: string;

  // Example: 54726 -> needsCollegeDegree == true
  //educationRequirements == filled
  //

  // If needsCollegeDegree is true, then educationRequirements should be filled.
  // Also, either degreeRequirementStatus.isDegreeMandatory/isDegreeAbsolutelyRequired or
  // degreeRequirementStatus.hasAlternativeQualifications/multipleQualificationPaths should be true,
  // and degreeRequirementStatus.alternativeQualifications should be filled in.

  educationRequirementsConsistency?: string;
  // If educationRequirements includes any degree requirement other than "college coursework" or "high school degree",
  // then either degreeRequirementStatus.isDegreeMandatory/isDegreeAbsolutelyRequired or
  // degreeRequirementStatus.hasAlternativeQualifications/multipleQualificationPaths should be true,
  // and degreeRequirementStatus.alternativeQualifications should be filled in.

  alternativeQualificationsConsistency?: string;
  // Checks that degreeRequirementStatus.hasAlternativeQualifications and degreeRequirementStatus.multipleQualificationPaths have identical results.

  degreeMandatoryConsistency?: string | boolean;
  // Checks that degreeRequirementStatus.isDegreeMandatory and degreeRequirementStatus.isDegreeAbsolutelyRequired have identical results.

  alternativesIfTrueConsistency?: string;
  // If degreeRequirementStatus.hasAlternativeQualifications or degreeRequirementStatus.multipleQualificationPaths is true,
  // then degreeRequirementStatus.alternativeQualifications should be filled in,
  // degreeRequirementStatus.substitutionPossible could be true,
  // and mandatoryStatusExplanations.degreeRequirementExplanation should be filled in.

  licenseIncludesDegreeRequirementConsistency?: string;
  // If professionalLicenseRequirement.includesDegreeRequirement is true,
  // then either degreeRequirementStatus.isDegreeMandatory/isDegreeAbsolutelyRequired or
  // degreeRequirementStatus.hasAlternativeQualifications/multipleQualificationPaths should be true,
  // and degreeRequirementStatus.alternativeQualifications should be filled in.

  barriersToNonDegreeApplicantsConsistency?: string;
  // If barriersToNonDegreeApplicants mentions a college or other higher education degree,
  // then either degreeRequirementStatus.isDegreeMandatory/isDegreeAbsolutelyRequired or
  // degreeRequirementStatus.hasAlternativeQualifications/multipleQualificationPaths should be true,
  // and degreeRequirementStatus.alternativeQualifications should be filled in,
  // and identify the same language in the job description.
}

// Interface representing the result of readability assessments for different education levels
interface ReadabilityAssessment {
  educationType: import("./educationTypes.js").EducationType; // The education level being assessed
  isComprehensible: boolean; // Whether the job description is fully comprehensible for this education level
  difficultLanguage?: string[]; // If not comprehensible, the language that is difficult to understand
  readingMismatch?: boolean; // Indicates "Reading Mismatch" as per prompts
}

// Interface representing the readability analysis of a job description
interface JobDescriptionReadabilityAnalysis {
  assessedEducationLevel: import("./educationTypes.js").EducationType; // The education level assessed for the job description (from Prompt #1)
  readingLevelMatchesDegreeRequirement: boolean; // True if assessed education level matches degree requirement
  readabilityAssessments: ReadabilityAssessment[]; // Array of readability assessments for different education levels
}

interface JobDescriptionInput {
  agentId: number;
  jobDescriptions: JobDescription[];
}
