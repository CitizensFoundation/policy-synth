import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class JustifyGoldPlatingAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private justifyNationalLawGoldPlating;
    private justifyNationalRegulationGoldPlating;
    private analyzeJustification;
    private checkEURegulationMinimums;
    private getJustificationAnalysisSystemPrompt;
    private getJustificationAnalysisUserPrompt;
    private getEURegulationMinimumsSystemPrompt;
    private getEURegulationMinimumsUserPrompt;
}
//# sourceMappingURL=justifyGoldPlating.d.ts.map