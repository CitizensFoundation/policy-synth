import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class GoldPlatingSearchAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private compareNationalLawToEULaw;
    private compareNationalRegulationToEULaw;
    private compareNationalLawToEURegulation;
    private compareNationalRegulationToEURegulation;
    private extractRelevantEuText;
    private translateToEnglish;
    goldPlatingTypes: string[];
    private analyzeGoldPlating;
    private performFinalAnalysis;
    private getFinalAnalysisSystemPrompt;
    private getFinalAnalysisUserPrompt;
    private processGoldPlatingResult;
    renderGoldPlatingType(goldPlatingType: string): string;
    private getGoldPlatingSystemPrompt;
    renderEuAndIcelandicLaws(euLaw: string, icelandicLaw: string): string;
    private getGoldPlatingUserPrompt;
}
//# sourceMappingURL=researchArticles.d.ts.map