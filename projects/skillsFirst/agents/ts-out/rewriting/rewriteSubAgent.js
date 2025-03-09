import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
export class RewriteSubAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    modelType = PsAiModelType.TextReasoning;
    get maxModelTokensOut() {
        return 16000;
    }
    get modelTemperature() {
        return 0.0;
    }
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    async rewriteJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Starting RewriteSubAgentOne for ${jobDescription.name}`);
        const systemPrompt = `<JobDescription>
${jobDescription.text}
</JobDescription>

You are an expert at rewriting complex job descriptions.

Given the job description above, rewrite the job description in full to a reading level equivalent to a 10th grade reading level.

The job title must remain unchanged.

Everything in the job description must be included in the rewritten version. Keep all data and information from the original job description.

Do not include any explanation or additional commentary in your output, only the rewritten job description here:`;
        const messages = [this.createSystemMessage(systemPrompt)];
        let resultText;
        try {
            resultText = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Large, messages, false);
        }
        catch (error) {
            this.logger.error(`RewriteSubAgentOne error for ${jobDescription.name}: ${error}`);
            this.memory.llmErrors.push(`RewriteSubAgentOne error for ${jobDescription.name}: ${error}`);
            throw error;
        }
        await this.updateRangedProgress(100, `RewriteSubAgentOne completed for ${jobDescription.name}`);
        return resultText;
    }
}
//# sourceMappingURL=rewriteSubAgent.js.map