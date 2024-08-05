import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class ArticleExtractionAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    maxExtractionRetries: number;
    articlesPerBatch: number;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(text: string, type: 'law' | 'regulation'): Promise<LawArticle[] | RegulationArticle[]>;
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
//# sourceMappingURL=extractArticles.d.ts.map