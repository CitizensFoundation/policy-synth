import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { EducationType, EducationTypes } from "../educationTypes.js"; // Adjust the path as needed

// Import necessary types and interfaces
// import {
//   JobDescriptionMemoryData,
//   JobDescription,
//   JobDescriptionDegreeAnalysis,
//   DataConsistencyChecks,
//   DegreeRequirementStatus,
//   MandatoryStatusExplanations,
//   ProfessionalLicenseRequirement,
// } from "../types.js";

export class ValidateJobDescriptionAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  override get maxModelTokensOut(): number {
    return 16384;
  }
  override get modelTemperature(): number {
    return 0.0;
  }

  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
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

  /**
   * Processing function for validating job descriptions.
   *
   * This function populates `jobDescription.degreeAnalysis.validationChecks`
   * with pass/fail/n/a for each check.
   */
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Validating data consistency for ${jobDescription.name}`
    );

    // Ensure degreeAnalysis exists
    jobDescription.degreeAnalysis =
      jobDescription.degreeAnalysis || ({} as JobDescriptionDegreeAnalysis);
    const degreeAnalysis = jobDescription.degreeAnalysis;

    // Ensure degreeRequirementStatus exists
    degreeAnalysis.degreeRequirementStatus =
      degreeAnalysis.degreeRequirementStatus || ({} as DegreeRequirementStatus);
    const degreeStatus = degreeAnalysis.degreeRequirementStatus;

    // Ensure mandatoryStatusExplanations exists
    degreeAnalysis.mandatoryStatusExplanations =
      degreeAnalysis.mandatoryStatusExplanations ||
      ({} as MandatoryStatusExplanations);
    const explanations = degreeAnalysis.mandatoryStatusExplanations;

    // Ensure professionalLicenseRequirement exists
    degreeAnalysis.professionalLicenseRequirement =
      degreeAnalysis.professionalLicenseRequirement ||
      ({} as ProfessionalLicenseRequirement);
    const professionalLicenseRequirement =
      degreeAnalysis.professionalLicenseRequirement;

    // Initialize validationChecks
    degreeAnalysis.validationChecks = {} as DataConsistencyChecks;
    const validationChecks = degreeAnalysis.validationChecks;

    // -----------------------------------------------
    // Checks 1-3, 5-8 in JavaScript
    // -----------------------------------------------

    // 1. cscRevisedConsistency
    if (jobDescription.cscRevised === true) {
      const conditionMet =
        degreeStatus.hasAlternativeQualifications === true &&
        degreeStatus.multipleQualificationPaths === true &&
        degreeStatus.isDegreeMandatory === false &&
        degreeStatus.isDegreeAbsolutelyRequired === false;

      validationChecks.cscRevisedConsistency = conditionMet ? "pass" : "fail";
    } else {
      validationChecks.cscRevisedConsistency = "n/a";
    }

    // 2. requiredAlternativeExplanationConsistency
    const bothRequiredAndAlternativeTrue =
      degreeStatus.isDegreeMandatory === true &&
      degreeStatus.hasAlternativeQualifications === true;
    const bothRequiredAndAlternativeFalse =
      degreeStatus.isDegreeMandatory === false &&
      degreeStatus.hasAlternativeQualifications === false;

    if (bothRequiredAndAlternativeTrue) {
      const explanationFilled =
        explanations.bothTrueExplanation !== undefined &&
        explanations.bothTrueExplanation.trim() !== "";

      validationChecks.requiredAlternativeExplanationConsistency = explanationFilled
        ? "pass"
        : "fail";
    } else if (bothRequiredAndAlternativeFalse) {
      const explanationFilled =
        explanations.bothFalseExplanation !== undefined &&
        explanations.bothFalseExplanation.trim() !== "";

      validationChecks.requiredAlternativeExplanationConsistency = explanationFilled
        ? "pass"
        : "fail";
    } else {
      // If one is true and the other is false, that's contradictory => fail
      validationChecks.requiredAlternativeExplanationConsistency = "fail";
    }

    // 3. needsCollegeDegreeConsistency
    if (degreeAnalysis.needsCollegeDegree === true) {
      const educationRequirementsFilled =
        degreeAnalysis.educationRequirements !== undefined &&
        degreeAnalysis.educationRequirements.length > 0;

      const degreeMandatoryOrAbsolutelyRequired =
        degreeStatus.isDegreeMandatory === true ||
        degreeStatus.isDegreeAbsolutelyRequired === true;

      const alternativesCondition =
        (degreeStatus.hasAlternativeQualifications === true ||
          degreeStatus.multipleQualificationPaths === true) &&
        degreeStatus.alternativeQualifications !== undefined &&
        degreeStatus.alternativeQualifications.length > 0;

      const conditionMet =
        educationRequirementsFilled &&
        (degreeMandatoryOrAbsolutelyRequired || alternativesCondition);

      validationChecks.needsCollegeDegreeConsistency = conditionMet
        ? "pass"
        : "fail";
    } else {
      validationChecks.needsCollegeDegreeConsistency = "n/a";
    }

    // 5. alternativeQualificationsConsistency
    if (
      degreeStatus.hasAlternativeQualifications !== undefined &&
      degreeStatus.multipleQualificationPaths !== undefined
    ) {
      const consistent =
        degreeStatus.hasAlternativeQualifications ===
        degreeStatus.multipleQualificationPaths;
      validationChecks.alternativeQualificationsConsistency = consistent
        ? "pass"
        : "fail";
    } else {
      validationChecks.alternativeQualificationsConsistency = "n/a";
    }

    // 6. degreeMandatoryConsistency
    if (
      degreeStatus.isDegreeMandatory !== undefined &&
      degreeStatus.isDegreeAbsolutelyRequired !== undefined
    ) {
      const consistent =
        degreeStatus.isDegreeMandatory ===
        degreeStatus.isDegreeAbsolutelyRequired;
      validationChecks.degreeMandatoryConsistency = consistent
        ? "pass"
        : "fail";
    } else {
      validationChecks.degreeMandatoryConsistency = "n/a";
    }

    // 7. alternativesIfTrueConsistency
    if (
      degreeStatus.hasAlternativeQualifications === true ||
      degreeStatus.multipleQualificationPaths === true
    ) {
      const alternativeQualificationsFilled =
        degreeStatus.alternativeQualifications !== undefined &&
        degreeStatus.alternativeQualifications.length > 0;

      const substitutionPossibleAcceptable =
        degreeStatus.substitutionPossible === true;

      const degreeRequirementExplanationFilled =
        explanations.degreeRequirementExplanation !== undefined &&
        explanations.degreeRequirementExplanation.trim() !== "";

      const conditionMet =
        alternativeQualificationsFilled &&
        substitutionPossibleAcceptable &&
        degreeRequirementExplanationFilled;

      validationChecks.alternativesIfTrueConsistency = conditionMet
        ? "pass"
        : "fail";
    } else {
      validationChecks.alternativesIfTrueConsistency = "n/a";
    }

    // 8. licenseIncludesDegreeRequirementConsistency
    if (
      professionalLicenseRequirement &&
      professionalLicenseRequirement.includesDegreeRequirement === true
    ) {
      const degreeMandatoryOrAbsolutelyRequired =
        degreeStatus.isDegreeMandatory === true ||
        degreeStatus.isDegreeAbsolutelyRequired === true;

      const alternativesCondition =
        (degreeStatus.hasAlternativeQualifications === true ||
          degreeStatus.multipleQualificationPaths === true) &&
        degreeStatus.alternativeQualifications !== undefined &&
        degreeStatus.alternativeQualifications.length > 0;

      const conditionMet =
        degreeMandatoryOrAbsolutelyRequired || alternativesCondition;

      validationChecks.licenseIncludesDegreeRequirementConsistency = conditionMet
        ? "pass"
        : "fail";
    } else {
      validationChecks.licenseIncludesDegreeRequirementConsistency = "n/a";
    }

    // -----------------------------------------------
    // Checks #4 and #9 require AI/LLM analysis
    // -----------------------------------------------

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

    // A simpler, clearer system prompt
    const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

<HigherDegreePhrases>
${higherDegreePhrases.join("\n")}
</HigherDegreePhrases>

You are an expert in analyzing text for higher-degree requirements.

Extracted Fields:
educationRequirements = ${JSON.stringify(degreeAnalysis.educationRequirements, null, 2)}
barriersToNonDegreeApplicants = ${JSON.stringify(degreeAnalysis.barriersToNonDegreeApplicants, null, 2)}
alternativeQualifications = ${JSON.stringify(degreeStatus.alternativeQualifications, null, 2)}

Please answer these three questions with "True" or "False" only, indicating whether you find any mention or match in the text:

1. Does the 'educationRequirements' field mention or match any higher-degrees above?
2. Does the 'barriersToNonDegreeApplicants' field mention or match any higher-degres above?
3. Do any of the 'alternativeQualifications' appear to match the job description text?

Return only the following JSON (no extra text or explanation):

\`\`\`json
{
  "includesHigherDegreeInEducationRequirements": "True/False",
  "mentionsHigherDegreeInBarriers": "True/False",
  "alternativeQualificationsMatchJobDescription": "True/False"
}
\`\`\`
`;

    // Call the LLM
    const messages = [this.createSystemMessage(systemPrompt)];
    const resultText = await this.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Large,
      messages
    );


    if (resultText) {
      // Map the string values "True"/"False" to booleans
      const mapResult = (value: string): boolean => {
        return value.toLowerCase() === "true";
      };

      const includesHigherDegreeReq = mapResult(
        resultText.includesHigherDegreeInEducationRequirements
      );
      const mentionsHigherDegreeInBarriers = mapResult(
        resultText.mentionsHigherDegreeInBarriers
      );
      const alternativeQualsMatch = mapResult(
        resultText.alternativeQualificationsMatchJobDescription
      );

      // #4. educationRequirementsConsistency
      if (includesHigherDegreeReq) {
        const degreeMandatoryOrAbsolutelyRequired =
          degreeStatus.isDegreeMandatory === true ||
          degreeStatus.isDegreeAbsolutelyRequired === true;

        const alternativesCondition =
          (degreeStatus.hasAlternativeQualifications === true ||
            degreeStatus.multipleQualificationPaths === true) &&
          degreeStatus.alternativeQualifications !== undefined &&
          degreeStatus.alternativeQualifications.length > 0;

        const conditionMet =
          degreeMandatoryOrAbsolutelyRequired || alternativesCondition;
        validationChecks.educationRequirementsConsistency = conditionMet
          ? "pass"
          : "fail";
      } else {
        validationChecks.educationRequirementsConsistency = "n/a";
      }

      // #9. barriersToNonDegreeApplicantsConsistency
      if (mentionsHigherDegreeInBarriers) {
        const degreeMandatoryOrAbsolutelyRequired =
          degreeStatus.isDegreeMandatory === true ||
          degreeStatus.isDegreeAbsolutelyRequired === true;

        const alternativesCondition =
          (degreeStatus.hasAlternativeQualifications === true ||
            degreeStatus.multipleQualificationPaths === true) &&
          degreeStatus.alternativeQualifications !== undefined &&
          degreeStatus.alternativeQualifications.length > 0;

        // Also check if alternative qualifications actually match
        const conditionMet =
          (degreeMandatoryOrAbsolutelyRequired || alternativesCondition) &&
          alternativeQualsMatch;

        validationChecks.barriersToNonDegreeApplicantsConsistency = conditionMet
          ? "pass"
          : "fail";
      } else {
        validationChecks.barriersToNonDegreeApplicantsConsistency = "n/a";
      }
    } else {
      this.logger.error(
        "Invalid response from LLM for data consistency validation."
      );
      throw new Error("LLM did not return the expected data for validation.");
    }

    await this.updateRangedProgress(
      100,
      "Data consistency validation completed"
    );
  }
}
