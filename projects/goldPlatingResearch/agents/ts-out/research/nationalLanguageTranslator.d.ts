import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class NationalLanguageTranslationAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private translateNationalLaw;
    private translateNationalRegulation;
    private translateResearch;
    private translateResearchResults;
    private translateText;
}
//# sourceMappingURL=nationalLanguageTranslator.d.ts.map