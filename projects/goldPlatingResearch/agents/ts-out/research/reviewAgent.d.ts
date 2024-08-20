import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class SupportTextReviewAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private reviewNationalLawSupportText;
    private normalizeArticleNumber;
    private reviewNationalRegulationSupportText;
    private analyzeSupportText;
    private getSupportTextAnalysisSystemPrompt;
    private getSupportTextAnalysisUserPrompt;
}
//# sourceMappingURL=reviewAgent.d.ts.map