import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export class IdentifyBarriersAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    maxModelTokensOut = 2048;
    modelTemperature = 0.0;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    // Processing function for identifying barriers
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Identifying barriers for non-degree applicants in ${jobDescription.name}`);
        const systemPrompt = `You are an expert in analyzing job descriptions.
Your task is to identify any barriers or obstacles stated, suggested, or described in the job description to hiring an applicant who does not have a college or university degree.

Job Description:
${jobDescription.text}

If there are barriers, describe them.
If no barriers are found, leave the field blank.
Do not fabricate any information.

Provide the output as a plain text description without any additional text.
`;
        const messages = [this.createSystemMessage(systemPrompt)];
        const resultText = await this.callModel(PsAiModelType.Text, this.modelSize, messages, false);
        jobDescription.degreeAnalysis = jobDescription.degreeAnalysis || {};
        jobDescription.degreeAnalysis.barriersToNonDegreeApplicants = resultText.trim();
        await this.updateRangedProgress(100, "Barriers identified");
    }
}
//# sourceMappingURL=identifyBarriers.js.map