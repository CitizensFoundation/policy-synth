import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class SimpleArticleExtractionAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    maxExtractionRetries: number;
    articlesPerBatch: number;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(text: string, type: "law" | "regulation" | "lawSupportArticle"): Promise<LawArticle[] | RegulationArticle[]>;
    private extractArticles;
    private extractArticleBatch;
    private callExtractionModel;
    private getExtractionSystemPrompt;
    private getExtractionUserPrompt;
    private isValidExtractionResult;
    private validateAndDeduplicateArticles;
    private validateArticle;
    private getValidationSystemPrompt;
    private getValidationUserPrompt;
}
//# sourceMappingURL=simpleExtractArticles.d.ts.map