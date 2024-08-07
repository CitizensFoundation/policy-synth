import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class GoldPlatingSearchAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private compareNationalLawToEULaw;
    private compareNationalRegulationToEULaw;
    private compareNationalLawToEURegulation;
    private compareNationalRegulationToEURegulation;
    private analyzeGoldPlating;
    private processGoldPlatingResult;
    private extractReasonForGoldPlating;
    private getGoldPlatingSystemPrompt;
    private getGoldPlatingUserPrompt;
}
//# sourceMappingURL=researchArticles.d.ts.map