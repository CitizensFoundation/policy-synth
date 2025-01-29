import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export class DetermineProfessionalLicenseRequirementAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    modelType = PsAiModelType.TextReasoning;
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
        let resultText = await this.callModel(this.modelType, this.modelSize, messages, true, true);
        if (!resultText) {
            this.memory.llmErrors.push(`DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            this.logger.error(`DetermineProfessionalLicenseRequirementAgent - ${this.modelType} - ${this.modelSize} - ${systemPrompt}`);
            // Calling a larger model to try to get a result and not a reasoning model TODO: Check this later with better reasoning models as this is due to random 500 errors in o1
            resultText = await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, messages, true);
        }
        const result = resultText;
        jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {};
        jobDescription.degreeAnalysis.professionalLicenseRequirement = result;
        await this.updateRangedProgress(100, "Professional license requirements determined");
    }
}
//# sourceMappingURL=additionalRequirements.js.map