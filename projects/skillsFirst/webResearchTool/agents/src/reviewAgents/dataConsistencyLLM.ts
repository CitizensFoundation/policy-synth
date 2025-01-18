import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { EducationType, EducationTypes } from '../educationTypes.js'; // Adjust the path as needed

// Import necessary types and interfaces
// Assuming these are defined in your codebase
// import { JobDescriptionMemoryData, JobDescription, JobDescriptionDegreeAnalysis, DataConsistencyChecks, DegreeRequirementStatus, MandatoryStatusExplanations, ProfessionalLicenseRequirement } from "../types.js";

export class ValidateJobDescriptionAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  override get maxModelTokensOut(): number {
    return 2048;
  }
  override get modelTemperature(): number {
    return 0.0;
  }

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  // Processing function for validating job descriptions using LLM
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Validating data consistency for ${jobDescription.name}`
    );

    // Ensure degreeAnalysis exists
    jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {} as JobDescriptionDegreeAnalysis;
    const degreeAnalysis = jobDescription.degreeAnalysis;

    // Ensure degreeRequirementStatus exists
    degreeAnalysis.degreeRequirementStatus = degreeAnalysis.degreeRequirementStatus || {} as DegreeRequirementStatus;
    const degreeStatus = degreeAnalysis.degreeRequirementStatus;

    // Ensure mandatoryStatusExplanations exists
    degreeAnalysis.mandatoryStatusExplanations = degreeAnalysis.mandatoryStatusExplanations || {} as MandatoryStatusExplanations;
    const explanations = degreeAnalysis.mandatoryStatusExplanations;

    // Ensure professionalLicenseRequirement exists
    degreeAnalysis.professionalLicenseRequirement = degreeAnalysis.professionalLicenseRequirement || {} as ProfessionalLicenseRequirement;
    const professionalLicenseRequirement = degreeAnalysis.professionalLicenseRequirement;

    // Initialize validationChecks
    degreeAnalysis.validationChecks = {} as DataConsistencyChecks;
    const validationChecks = degreeAnalysis.validationChecks;

    // Prepare higher degree phrases for the LLM to reference
    const higherDegreeTypes = [
      EducationType.AssociatesDegree,
      EducationType.BachelorsDegree,
      EducationType.MastersDegree,
      EducationType.DoctoralDegree,
    ];

    const higherDegreePhrases = higherDegreeTypes
      .flatMap((type) => EducationTypes[type].phrases)
      .map((phrase) => phrase.toLowerCase());

    // Prepare the system prompt for the LLM
    const systemPrompt = `You are an expert in analyzing job descriptions for data consistency.

Your task is to perform the following validation checks based on the job description and the extracted data.

Job Description:
${jobDescription.text}

Extracted Data:

degreeStatus:
${JSON.stringify(degreeStatus, null, 2)}

explanations:
${JSON.stringify(explanations, null, 2)}

professionalLicenseRequirement:
${JSON.stringify(professionalLicenseRequirement, null, 2)}

degreeAnalysis:
${JSON.stringify({
      needsCollegeDegree: degreeAnalysis.needsCollegeDegree,
      educationRequirements: degreeAnalysis.educationRequirements,
      barriersToNonDegreeApplicants: degreeAnalysis.barriersToNonDegreeApplicants
    }, null, 2)}

List of higher degree phrases to consider:
${JSON.stringify(higherDegreePhrases, null, 2)}

Validation Checks:

1. **cscRevisedConsistency**:
   - If \`jobDescription.cscRevised\` is true, then the following conditions must be met:
     - \`degreeStatus.hasAlternativeQualifications === true\`
     - \`degreeStatus.multipleQualificationPaths === true\`
     - \`degreeStatus.isDegreeMandatory === false\`
     - \`degreeStatus.isDegreeAbsolutelyRequired === false\`

2. **requiredAlternativeExplanationConsistency**:
   - If both \`degreeStatus.isDegreeMandatory\` and \`degreeStatus.hasAlternativeQualifications\` are true, then \`explanations.bothTrueExplanation\` must be filled (not empty).
   - If both \`degreeStatus.isDegreeMandatory\` and \`degreeStatus.hasAlternativeQualifications\` are false, then \`explanations.bothFalseExplanation\` must be filled (not empty).

3. **needsCollegeDegreeConsistency**:
   - If \`degreeAnalysis.needsCollegeDegree\` is true, then:
     - \`degreeAnalysis.educationRequirements\` must be filled (not empty).
     - At least one of \`degreeStatus.isDegreeMandatory\` or \`degreeStatus.isDegreeAbsolutelyRequired\` is true, or the following conditions are met:
       - At least one of \`degreeStatus.hasAlternativeQualifications\` or \`degreeStatus.multipleQualificationPaths\` is true.
       - \`degreeStatus.alternativeQualifications\` must be filled (not empty).

4. **educationRequirementsConsistency**:
   - If \`degreeAnalysis.educationRequirements\` includes any degree requirement that mentions any of the higher degree phrases listed above, then:
     - At least one of \`degreeStatus.isDegreeMandatory\` or \`degreeStatus.isDegreeAbsolutelyRequired\` is true, or the following conditions are met:
       - At least one of \`degreeStatus.hasAlternativeQualifications\` or \`degreeStatus.multipleQualificationPaths\` is true.
       - \`degreeStatus.alternativeQualifications\` must be filled (not empty).

5. **alternativeQualificationsConsistency**:
   - \`degreeStatus.hasAlternativeQualifications\` and \`degreeStatus.multipleQualificationPaths\` should have identical values (both true or both false).

6. **degreeMandatoryConsistency**:
   - \`degreeStatus.isDegreeMandatory\` and \`degreeStatus.isDegreeAbsolutelyRequired\` should have identical values (both true or both false).

7. **alternativesIfTrueConsistency**:
   - If \`degreeStatus.hasAlternativeQualifications\` or \`degreeStatus.multipleQualificationPaths\` is true, then:
     - \`degreeStatus.alternativeQualifications\` must be filled (not empty).
     - \`degreeStatus.substitutionPossible === true\`
     - \`explanations.degreeRequirementExplanation\` must be filled (not empty).

8. **licenseIncludesDegreeRequirementConsistency**:
   - If \`professionalLicenseRequirement.includesDegreeRequirement\` is true, then:
     - At least one of \`degreeStatus.isDegreeMandatory\` or \`degreeStatus.isDegreeAbsolutelyRequired\` is true, or the following conditions are met:
       - At least one of \`degreeStatus.hasAlternativeQualifications\` or \`degreeStatus.multipleQualificationPaths\` is true.
       - \`degreeStatus.alternativeQualifications\` must be filled (not empty).

9. **barriersToNonDegreeApplicantsConsistency**:
   - If \`degreeAnalysis.barriersToNonDegreeApplicants\` mentions any of the higher degree phrases listed above, then:
     - At least one of \`degreeStatus.isDegreeMandatory\` or \`degreeStatus.isDegreeAbsolutelyRequired\` is true, or the following conditions are met:
       - At least one of \`degreeStatus.hasAlternativeQualifications\` or \`degreeStatus.multipleQualificationPaths\` is true.
       - \`degreeStatus.alternativeQualifications\` must be filled (not empty).
     - The same degree-related language is identified in the job description.

**Your task is to evaluate each validation check, and for each one, determine whether the condition is met.**

For each validation check, output the result as "True", "False", or "Undefined" (if not applicable).

Provide the results in the following JSON format:

\`\`\`json
{
  "validationChecks": {
    "cscRevisedConsistency": "True/False/Undefined",
    "requiredAlternativeExplanationConsistency": "True/False/Undefined",
    "needsCollegeDegreeConsistency": "True/False/Undefined",
    "educationRequirementsConsistency": "True/False/Undefined",
    "alternativeQualificationsConsistency": "True/False/Undefined",
    "degreeMandatoryConsistency": "True/False/Undefined",
    "alternativesIfTrueConsistency": "True/False/Undefined",
    "licenseIncludesDegreeRequirementConsistency": "True/False/Undefined",
    "barriersToNonDegreeApplicantsConsistency": "True/False/Undefined"
  }
}
\`\`\`

Do not include any explanations or additional text. Output only the JSON object.`;

    // Call the LLM
    const messages = [this.createSystemMessage(systemPrompt)];

    const resultText = await this.callModel(
      PsAiModelType.Text,
      this.modelSize,
      messages,
      true // parse as JSON
    );

    // Parse the LLM's response
    let result;
    try {
      result = JSON.parse(resultText) as { validationChecks: DataConsistencyChecks };
    } catch (error) {
      this.logger.error('Error parsing LLM response:', error);
      throw new Error('Failed to parse LLM response as JSON.');
    }

    if (result && result.validationChecks) {
      // Map the string values to boolean or undefined
      const mapResult = (value: string | boolean): boolean | undefined => {
        if (typeof value === 'boolean') return value;
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return undefined;
      };

      validationChecks.cscRevisedConsistency = mapResult(result.validationChecks.cscRevisedConsistency!);
      validationChecks.requiredAlternativeExplanationConsistency = mapResult(result.validationChecks.requiredAlternativeExplanationConsistency!);
      validationChecks.needsCollegeDegreeConsistency = mapResult(result.validationChecks.needsCollegeDegreeConsistency!);
      validationChecks.educationRequirementsConsistency = mapResult(result.validationChecks.educationRequirementsConsistency!);
      validationChecks.alternativeQualificationsConsistency = mapResult(result.validationChecks.alternativeQualificationsConsistency!);
      validationChecks.degreeMandatoryConsistency = mapResult(result.validationChecks.degreeMandatoryConsistency!);
      validationChecks.alternativesIfTrueConsistency = mapResult(result.validationChecks.alternativesIfTrueConsistency!);
      validationChecks.licenseIncludesDegreeRequirementConsistency = mapResult(result.validationChecks.licenseIncludesDegreeRequirementConsistency!);
      validationChecks.barriersToNonDegreeApplicantsConsistency = mapResult(result.validationChecks.barriersToNonDegreeApplicantsConsistency!);
    } else {
      // Handle parsing error or invalid response
      this.logger.error('Invalid response from LLM for validation checks.');
      throw new Error('LLM did not return the expected validation checks.');
    }

    await this.updateRangedProgress(100, "Data consistency validation completed");
  }
}