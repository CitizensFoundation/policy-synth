import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { EducationType, EducationTypes } from '../educationTypes.js'; // Adjust the path as needed
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
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    // Processing function for validating job descriptions
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Validating data consistency for ${jobDescription.name}`);
        // Ensure degreeAnalysis exists
        jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {};
        const degreeAnalysis = jobDescription.degreeAnalysis;
        // Ensure degreeRequirementStatus exists
        degreeAnalysis.degreeRequirementStatus = degreeAnalysis.degreeRequirementStatus || {};
        const degreeStatus = degreeAnalysis.degreeRequirementStatus;
        // Ensure mandatoryStatusExplanations exists
        degreeAnalysis.mandatoryStatusExplanations = degreeAnalysis.mandatoryStatusExplanations || {};
        const explanations = degreeAnalysis.mandatoryStatusExplanations;
        // Ensure professionalLicenseRequirement exists
        degreeAnalysis.professionalLicenseRequirement = degreeAnalysis.professionalLicenseRequirement || {};
        const professionalLicenseRequirement = degreeAnalysis.professionalLicenseRequirement;
        // Initialize validationChecks
        degreeAnalysis.validationChecks = {};
        const validationChecks = degreeAnalysis.validationChecks;
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
            validationChecks.requiredAlternativeExplanationConsistency = explanationFilled;
        }
        else if (bothRequiredAndAlternativeFalse) {
            const explanationFilled = explanations.bothFalseExplanation !== undefined &&
                explanations.bothFalseExplanation.trim() !== "";
            validationChecks.requiredAlternativeExplanationConsistency = explanationFilled;
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
        // 4. educationRequirementsConsistency
        if (degreeAnalysis.educationRequirements && degreeAnalysis.educationRequirements.length > 0) {
            // Function to detect if the requirement mentions a higher degree
            const mentionsHigherDegree = (requirement) => {
                // List of higher degree types excluding 'collegeCoursework' and 'highschool'
                const higherDegreeTypes = [
                    EducationType.AssociatesDegree,
                    EducationType.BachelorsDegree,
                    EducationType.MastersDegree,
                    EducationType.DoctoralDegree,
                ];
                // Combine all phrases associated with higher degrees
                const higherDegreePhrases = higherDegreeTypes
                    .flatMap((type) => EducationTypes[type].phrases)
                    .map((phrase) => phrase.toLowerCase());
                // Normalize the requirement text
                const normalizedReq = requirement.toLowerCase();
                // Check if any higher degree phrases are present in the requirement
                return higherDegreePhrases.some((phrase) => normalizedReq.includes(phrase));
            };
            // Check if any of the education requirements mention a higher degree
            const includesHigherDegreeRequirement = degreeAnalysis.educationRequirements.some((req) => {
                if (typeof req === 'string' && req.includes(':')) {
                    const [requirementTypePart] = req.split(':');
                    return mentionsHigherDegree(requirementTypePart);
                }
                else if (typeof req === 'string') {
                    // If there's no ':', use the whole string
                    return mentionsHigherDegree(req);
                }
                else {
                    // If req is not a string, skip this item
                    return false;
                }
            });
            if (includesHigherDegreeRequirement) {
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
        }
        else {
            // If educationRequirements is empty or undefined, we consider the check not applicable.
            validationChecks.educationRequirementsConsistency = undefined;
        }
        // 5. alternativeQualificationsConsistency
        if (degreeStatus.hasAlternativeQualifications !== undefined &&
            degreeStatus.multipleQualificationPaths !== undefined) {
            validationChecks.alternativeQualificationsConsistency =
                degreeStatus.hasAlternativeQualifications === degreeStatus.multipleQualificationPaths;
        }
        else {
            // If either field is undefined, we cannot perform the check.
            validationChecks.alternativeQualificationsConsistency = undefined;
        }
        // 6. degreeMandatoryConsistency
        if (degreeStatus.isDegreeMandatory !== undefined &&
            degreeStatus.isDegreeAbsolutelyRequired !== undefined) {
            validationChecks.degreeMandatoryConsistency =
                degreeStatus.isDegreeMandatory === degreeStatus.isDegreeAbsolutelyRequired;
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
        // 9. barriersToNonDegreeApplicantsConsistency
        if (degreeAnalysis.barriersToNonDegreeApplicants) {
            // Preprocess text function
            const preprocessText = (text) => {
                return text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').toLowerCase().trim();
            };
            const levenshteinDistance = (a, b) => {
                const an = a.length;
                const bn = b.length;
                const matrix = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
                for (let i = 0; i <= an; i++) {
                    matrix[i][0] = i;
                }
                for (let j = 0; j <= bn; j++) {
                    matrix[0][j] = j;
                }
                for (let i = 1; i <= an; i++) {
                    for (let j = 1; j <= bn; j++) {
                        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                        const above = matrix[i - 1][j] + 1;
                        const left = matrix[i][j - 1] + 1;
                        const diag = matrix[i - 1][j - 1] + cost;
                        matrix[i][j] = Math.min(above, left, diag);
                    }
                }
                return matrix[an][bn];
            };
            // Function to calculate similarity percentage
            const similarity = (a, b) => {
                const distance = levenshteinDistance(a, b);
                const maxLength = Math.max(a.length, b.length);
                return ((maxLength - distance) / maxLength) * 100;
            };
            // Function to detect if the text mentions a higher degree
            const mentionsDegree = (text) => {
                // List of higher degree types excluding 'collegeCoursework' and 'highschool'
                const higherDegreeTypes = [
                    EducationType.AssociatesDegree,
                    EducationType.BachelorsDegree,
                    EducationType.MastersDegree,
                    EducationType.DoctoralDegree,
                ];
                // Combine all phrases associated with higher degrees
                const higherDegreePhrases = higherDegreeTypes
                    .flatMap((type) => EducationTypes[type].phrases)
                    .map((phrase) => phrase.toLowerCase());
                // Normalize the text
                const normalizedText = text.toLowerCase();
                // Check if any higher degree phrases are present in the text
                return higherDegreePhrases.some((phrase) => normalizedText.includes(phrase));
            };
            if (mentionsDegree(degreeAnalysis.barriersToNonDegreeApplicants)) {
                const degreeMandatoryOrAbsolutelyRequired = degreeStatus.isDegreeMandatory === true ||
                    degreeStatus.isDegreeAbsolutelyRequired === true;
                const alternativesCondition = (degreeStatus.hasAlternativeQualifications === true ||
                    degreeStatus.multipleQualificationPaths === true) &&
                    degreeStatus.alternativeQualifications !== undefined &&
                    degreeStatus.alternativeQualifications.length > 0;
                // Preprocess job description text
                const jobDescriptionText = preprocessText(jobDescription.text);
                // Preprocess alternative qualifications and check for fuzzy matches
                const alternativeLanguageMatches = degreeStatus.alternativeQualifications?.some((qualification) => {
                    const normalizedQualification = preprocessText(qualification);
                    // Calculate similarity percentage
                    const similarityPercentage = similarity(normalizedQualification, jobDescriptionText);
                    // Define a threshold for similarity (e.g., 80%)
                    return similarityPercentage >= 80;
                });
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
            // If barriersToNonDegreeApplicants is not provided, the check is not applicable.
            validationChecks.barriersToNonDegreeApplicantsConsistency = undefined;
        }
        await this.updateRangedProgress(100, "Data consistency validation completed");
    }
}
//# sourceMappingURL=dataConsistencyTS.js.map