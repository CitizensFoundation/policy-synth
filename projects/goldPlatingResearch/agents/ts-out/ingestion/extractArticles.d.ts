import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class ArticleExtractionAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    maxModelTokensOut: number;
    modelTemperature: number;
    maxExtractionRetries: number;
    maxValidationRetries: number;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(text: string, type: "law" | "regulation" | "lawSupportArticle", lastArticleNumber?: number, xmlUrl?: string, lawArticleUrl?: string): Promise<LawArticle[] | RegulationArticle[]>;
    private getLastArticleNumber;
    getArticleTextNumber(type: "law" | "regulation" | "lawSupportArticle", articleNumber: number): string;
    private extractLawSupportArticles;
    private extractArticles;
    private extractSingleArticle;
    private callExtractionModel;
    private isValidExtractionResult;
}
//# sourceMappingURL=extractArticles.d.ts.map