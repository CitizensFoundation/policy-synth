import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export class DetermineProfessionalLicenseRequirementAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    modelType = PsAiModelType.TextReasoning;
    static allLicenceTypes = [];
    get maxModelTokensOut() {
        return 100000;
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
    // Processing function for determining professional license requirements
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Determining professional license requirements for ${jobDescription.name}`);
        const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions for professional license requirements.

Your task is to determine whether any professional license is required that might include a college or university degree requirement.

Please answer the following questions:

- ProfessionalLicenseRequirement.isLicenseRequired:
  Is a specified professional license mandatory to be hired?
  Answer: true/false

- ProfessionalLicenseRequirement.licenseDescription:
  Quote the language describing the professional license requirement.

- ProfessionalLicenseRequirement.issuingAuthority:
  State the issuing entity of the professional license if known from the job description or your expertise.

- ProfessionalLicenseRequirement.includesDegreeRequirement:
  Does the professional license requirement include obtaining one of the specified degrees?
  Answer: true/false

Provide the answers in the following JSON format:

\`\`\`json
{
  "isLicenseRequired": boolean,
  "licenseDescription": "string",
  "issuingAuthority": "string",
  "includesDegreeRequirement": boolean
}
\`\`\`

Do not include any explanations or comments before or after the JSON output.
`;
        const messages = [this.createSystemMessage(systemPrompt)];
        let resultText;
        try {
            resultText = await this.callModel(this.modelType, this.modelSize, messages, true, true);
        }
        catch (error) {
            this.logger.error(error);
            this.memory.llmErrors.push(`DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            this.logger.error(`DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
        }
        if (!resultText) {
            this.memory.llmErrors.push(`DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            this.logger.error(`DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
            resultText = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Large, messages, true);
        }
        const result = resultText;
        jobDescription.degreeAnalysis =
            jobDescription.degreeAnalysis || {};
        jobDescription.degreeAnalysis.professionalLicenseRequirement = result;
        if (jobDescription.degreeAnalysis &&
            jobDescription.degreeAnalysis.professionalLicenseRequirement &&
            jobDescription.degreeAnalysis.professionalLicenseRequirement
                .isLicenseRequired) {
            await this.processLicenseTypes(jobDescription);
        }
        await this.updateRangedProgress(100, "Professional license requirements determined");
    }
    async processLicenseTypes(jobDescription) {
        await this.updateRangedProgress(0, `Determining license type for ${jobDescription.name}`);
        // Prepare a prompt that includes the current list of discovered license types.
        const existingLicenceTypes = DetermineProfessionalLicenseRequirementAgent.allLicenceTypes;
        const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert in analyzing job descriptions for license requirements.

Given the job description below, determine a standardized and simple license type that covers wide areas of professional or other types of licenses.
If the job description suggests a license type similar to one already in the existing list, please use that same license type.

${existingLicenceTypes.length > 0
            ? `<ExistingLicenseTypes>
${existingLicenceTypes.join("\n")}
</ExistingLicenseTypes>
`
            : ""}


Please provide the license type in the following JSON format:

\\\json
{
  "licenseType": "string"
}
\\\

Do not include any explanations or comments before or after the JSON output.
`;
        const messages = [this.createSystemMessage(systemPrompt)];
        let resultText;
        try {
            resultText = await this.callModel(this.modelType, this.modelSize, messages, true, true);
        }
        catch (error) {
            this.logger.error(error);
            this.memory.llmErrors.push(`processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            this.logger.error(`processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
        }
        if (!resultText) {
            this.memory.llmErrors.push(`processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            this.logger.error(`processLicenseTypes - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            // Calling a larger model to try to get a result and not a reasoning model
            resultText = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Large, messages, true);
        }
        let result;
        try {
            result = JSON.parse(resultText);
        }
        catch (e) {
            this.logger.error("Error parsing JSON from LLM result in processLicenseTypes", e);
            result = { licenseType: "" };
        }
        // Ensure jobDescription.degreeAnalysis exists and update licenseTypes.
        jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {};
        if (!jobDescription.degreeAnalysis.professionalLicenseRequirement) {
            jobDescription.degreeAnalysis.professionalLicenseRequirement =
                {};
        }
        jobDescription.degreeAnalysis.professionalLicenseRequirement.licenseType =
            result.licenseType;
        // Add the determined license type to the static array if it's new.
        if (result.licenseType &&
            !DetermineProfessionalLicenseRequirementAgent.allLicenceTypes.includes(result.licenseType)) {
            DetermineProfessionalLicenseRequirementAgent.allLicenceTypes.push(result.licenseType);
        }
        await this.updateRangedProgress(100, "License type determined");
    }
}
//# sourceMappingURL=additionalRequirements.js.map