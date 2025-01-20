import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { EducationType, EducationTypes } from "../educationTypes.js"; // Adjust the path as needed
// Import necessary types and interfaces
// Assuming these are defined in your codebase
// import { JobDescriptionMemoryData, JobDescription, JobDescriptionDegreeAnalysis, DataConsistencyChecks, DegreeRequirementStatus, MandatoryStatusExplanations, ProfessionalLicenseRequirement } from "../types.js";
export class ValidateJobDescriptionAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    get maxModelTokensOut() {
        return 16384;
    }
    get modelTemperature() {
        return 0.0;
    }
    get reasoningEffort() {
        return "high";
    }
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    // Processing function for validating job descriptions
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Validating data consistency for ${jobDescription.name}`);
        // Ensure degreeAnalysis exists
        jobDescription.degreeAnalysis =
            jobDescription.degreeAnalysis || {};
        const degreeAnalysis = jobDescription.degreeAnalysis;
        // Ensure degreeRequirementStatus exists
        degreeAnalysis.degreeRequirementStatus =
            degreeAnalysis.degreeRequirementStatus || {};
        const degreeStatus = degreeAnalysis.degreeRequirementStatus;
        // Ensure mandatoryStatusExplanations exists
        degreeAnalysis.mandatoryStatusExplanations =
            degreeAnalysis.mandatoryStatusExplanations ||
                {};
        const explanations = degreeAnalysis.mandatoryStatusExplanations;
        // Ensure professionalLicenseRequirement exists
        degreeAnalysis.professionalLicenseRequirement =
            degreeAnalysis.professionalLicenseRequirement ||
                {};
        const professionalLicenseRequirement = degreeAnalysis.professionalLicenseRequirement;
        // Initialize validationChecks
        degreeAnalysis.validationChecks = {};
        const validationChecks = degreeAnalysis.validationChecks;
        // Implement validation checks 1-3 and 5-8 in JavaScript
        // 1. cscRevisedConsistency
        if (jobDescription.cscRevised === true) {
            const conditionMet = degreeStatus.hasAlternativeQualifications === true &&
                degreeStatus.multipleQualificationPaths === true &&
                degreeStatus.isDegreeMandatory === false &&
                degreeStatus.isDegreeAbsolutelyRequired === false;
            validationChecks.cscRevisedConsistency = conditionMet;
        }
        else {
            // If cscRevised is not true, we consider the consistency check not applicable.
            validationChecks.cscRevisedConsistency = undefined;
        }
        // 2. requiredAlternativeExplanationConsistency
        const bothRequiredAndAlternativeTrue = degreeStatus.isDegreeMandatory === true &&
            degreeStatus.hasAlternativeQualifications === true;
        const bothRequiredAndAlternativeFalse = degreeStatus.isDegreeMandatory === false &&
            degreeStatus.hasAlternativeQualifications === false;
        if (bothRequiredAndAlternativeTrue) {
            const explanationFilled = explanations.bothTrueExplanation !== undefined &&
                explanations.bothTrueExplanation.trim() !== "";
            validationChecks.requiredAlternativeExplanationConsistency =
                explanationFilled;
        }
        else if (bothRequiredAndAlternativeFalse) {
            const explanationFilled = explanations.bothFalseExplanation !== undefined &&
                explanations.bothFalseExplanation.trim() !== "";
            validationChecks.requiredAlternativeExplanationConsistency =
                explanationFilled;
        }
        else {
            // If 'required' and 'alternative' are not both true or both false, the check is not applicable.
            validationChecks.requiredAlternativeExplanationConsistency = undefined;
        }
        // 3. needsCollegeDegreeConsistency
        if (degreeAnalysis.needsCollegeDegree === true) {
            const educationRequirementsFilled = degreeAnalysis.educationRequirements !== undefined &&
                degreeAnalysis.educationRequirements.length > 0;
            const degreeMandatoryOrAbsolutelyRequired = degreeStatus.isDegreeMandatory === true ||
                degreeStatus.isDegreeAbsolutelyRequired === true;
            const alternativesCondition = (degreeStatus.hasAlternativeQualifications === true ||
                degreeStatus.multipleQualificationPaths === true) &&
                degreeStatus.alternativeQualifications !== undefined &&
                degreeStatus.alternativeQualifications.length > 0;
            validationChecks.needsCollegeDegreeConsistency =
                educationRequirementsFilled &&
                    (degreeMandatoryOrAbsolutelyRequired || alternativesCondition);
        }
        else {
            // If needsCollegeDegree is not true, we consider the consistency check not applicable.
            validationChecks.needsCollegeDegreeConsistency = undefined;
        }
        // 5. alternativeQualificationsConsistency
        if (degreeStatus.hasAlternativeQualifications !== undefined &&
            degreeStatus.multipleQualificationPaths !== undefined) {
            validationChecks.alternativeQualificationsConsistency =
                degreeStatus.hasAlternativeQualifications ===
                    degreeStatus.multipleQualificationPaths;
        }
        else {
            // If either field is undefined, we cannot perform the check.
            validationChecks.alternativeQualificationsConsistency = undefined;
        }
        // 6. degreeMandatoryConsistency
        if (degreeStatus.isDegreeMandatory !== undefined &&
            degreeStatus.isDegreeAbsolutelyRequired !== undefined) {
            validationChecks.degreeMandatoryConsistency =
                degreeStatus.isDegreeMandatory ===
                    degreeStatus.isDegreeAbsolutelyRequired;
        }
        else {
            // If either field is undefined, we cannot perform the check.
            validationChecks.degreeMandatoryConsistency = undefined;
        }
        // 7. alternativesIfTrueConsistency
        if (degreeStatus.hasAlternativeQualifications === true ||
            degreeStatus.multipleQualificationPaths === true) {
            const alternativeQualificationsFilled = degreeStatus.alternativeQualifications !== undefined &&
                degreeStatus.alternativeQualifications.length > 0;
            // substitutionPossible should be true
            const substitutionPossibleAcceptable = degreeStatus.substitutionPossible === true;
            const degreeRequirementExplanationFilled = explanations.degreeRequirementExplanation !== undefined &&
                explanations.degreeRequirementExplanation.trim() !== "";
            validationChecks.alternativesIfTrueConsistency =
                alternativeQualificationsFilled &&
                    substitutionPossibleAcceptable &&
                    degreeRequirementExplanationFilled;
        }
        else {
            // If neither hasAlternativeQualifications nor multipleQualificationPaths is true, the check is not applicable.
            validationChecks.alternativesIfTrueConsistency = undefined;
        }
        // 8. licenseIncludesDegreeRequirementConsistency
        if (professionalLicenseRequirement &&
            professionalLicenseRequirement.includesDegreeRequirement === true) {
            const degreeMandatoryOrAbsolutelyRequired = degreeStatus.isDegreeMandatory === true ||
                degreeStatus.isDegreeAbsolutelyRequired === true;
            const alternativesCondition = (degreeStatus.hasAlternativeQualifications === true ||
                degreeStatus.multipleQualificationPaths === true) &&
                degreeStatus.alternativeQualifications !== undefined &&
                degreeStatus.alternativeQualifications.length > 0;
            validationChecks.licenseIncludesDegreeRequirementConsistency =
                degreeMandatoryOrAbsolutelyRequired || alternativesCondition;
        }
        else {
            // If includesDegreeRequirement is not true, we consider the check not applicable.
            validationChecks.licenseIncludesDegreeRequirementConsistency = undefined;
        }
        // Now, for the parts of validation checks 4 and 9 that require AI analysis
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
        const systemPrompt = `You are an expert in analyzing text for specific content.

    Based on the provided data, answer the following questions with "True" or "False".

    Job Description Text:
    ${jobDescription.text}

    Extracted Data:

    degreeAnalysis.educationRequirements:
    ${JSON.stringify(degreeAnalysis.educationRequirements, null, 2)}

    degreeAnalysis.barriersToNonDegreeApplicants:
    ${JSON.stringify(degreeAnalysis.barriersToNonDegreeApplicants, null, 2)}

    degreeStatus.alternativeQualifications:
    ${JSON.stringify(degreeStatus.alternativeQualifications, null, 2)}

    List of higher degree phrases to consider:
    ${JSON.stringify(higherDegreePhrases, null, 2)}

    Questions:

    1. Does \`degreeAnalysis.educationRequirements\` include any degree requirement that mentions or closely matches any of the higher degree phrases listed above?

    Answer: True/False

    2. Does \`degreeAnalysis.barriersToNonDegreeApplicants\` mention or closely match any of the higher degree phrases listed above?

    Answer: True/False

    3. Do any of \`degreeStatus.alternativeQualifications\` closely match any part of the job description text?

    Answer: True/False

    Provide your answers in the following JSON format:

    \`\`\`json
    {
      "includesHigherDegreeInEducationRequirements": "True/False",
      "mentionsHigherDegreeInBarriers": "True/False",
      "alternativeQualificationsMatchJobDescription": "True/False"
    }
    \`\`\`

    Do not include any explanations or additional text. Output only the JSON object.`;
        // Call the LLM
        const messages = [this.createSystemMessage(systemPrompt)];
        const resultText = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Large, messages, true // Indicate we expect JSON back
        );
        let result;
        if (typeof resultText === "string") {
            // Extract JSON from the resultText
            let jsonString = resultText;
            // Use a regular expression to match and extract JSON content from code blocks
            const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
            const match = resultText.match(jsonCodeBlockRegex);
            if (match && match[1]) {
                jsonString = match[1];
                this.logger.debug("Extracted JSON from code block");
            }
            else {
                this.logger.warn("No JSON code block found in LLM response, using entire response as JSON");
            }
            // Parse the extracted JSON string
            try {
                result = JSON.parse(jsonString);
                this.logger.info("Successfully parsed JSON from string response");
            }
            catch (error) {
                this.logger.error("Error parsing LLM response:", error);
                throw new Error("Failed to parse LLM response as JSON.");
            }
        }
        else if (typeof resultText === "object") {
            // LLM returned an object, use it directly
            result = resultText;
            this.logger.debug("LLM response is an object, using it directly");
            this.logger.info("Successfully received JSON object from LLM");
        }
        else {
            throw new Error(`Unexpected type of LLM response: ${typeof resultText}`);
        }
        if (result) {
            // Map the string values to boolean
            const mapResult = (value) => {
                return value.toLowerCase() === "true";
            };
            // Use the LLM results in the JavaScript logic for validation checks 4 and 9
            // 4. educationRequirementsConsistency
            if (mapResult(result.includesHigherDegreeInEducationRequirements)) {
                const degreeMandatoryOrAbsolutelyRequired = degreeStatus.isDegreeMandatory === true ||
                    degreeStatus.isDegreeAbsolutelyRequired === true;
                const alternativesCondition = (degreeStatus.hasAlternativeQualifications === true ||
                    degreeStatus.multipleQualificationPaths === true) &&
                    degreeStatus.alternativeQualifications !== undefined &&
                    degreeStatus.alternativeQualifications.length > 0;
                validationChecks.educationRequirementsConsistency =
                    degreeMandatoryOrAbsolutelyRequired || alternativesCondition;
            }
            else {
                // If educationRequirements does not include higher degrees, we consider the check not applicable.
                validationChecks.educationRequirementsConsistency = undefined;
            }
            // 9. barriersToNonDegreeApplicantsConsistency
            if (mapResult(result.mentionsHigherDegreeInBarriers)) {
                const degreeMandatoryOrAbsolutelyRequired = degreeStatus.isDegreeMandatory === true ||
                    degreeStatus.isDegreeAbsolutelyRequired === true;
                const alternativesCondition = (degreeStatus.hasAlternativeQualifications === true ||
                    degreeStatus.multipleQualificationPaths === true) &&
                    degreeStatus.alternativeQualifications !== undefined &&
                    degreeStatus.alternativeQualifications.length > 0;
                const alternativeLanguageMatches = mapResult(result.alternativeQualificationsMatchJobDescription);
                validationChecks.barriersToNonDegreeApplicantsConsistency =
                    (degreeMandatoryOrAbsolutelyRequired || alternativesCondition) &&
                        alternativeLanguageMatches;
            }
            else {
                // If barriersToNonDegreeApplicants does not mention a higher degree, the check is not applicable.
                validationChecks.barriersToNonDegreeApplicantsConsistency = undefined;
            }
        }
        else {
            // Handle parsing error or invalid response
            this.logger.error("Invalid response from LLM for data consistency validation.");
            throw new Error("LLM did not return the expected data for validation.");
        }
        await this.updateRangedProgress(100, "Data consistency validation completed");
    }
}
//# sourceMappingURL=dataConsistencyLLMTSHybrid.js.map