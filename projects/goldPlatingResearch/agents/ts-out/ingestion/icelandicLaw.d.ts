import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class IcelandicLawXmlAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    skipAiModels: boolean;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(item: GoldplatingResearchItem): Promise<void>;
    processLawXml(url: string): Promise<LawArticle[]>;
    private fetchXmlContent;
    private extractArticles;
    private extractArticleContent;
    private extractSentences;
    private isValidExtractionResult;
    static runFromCommandLine(url: string): Promise<void>;
}
//# sourceMappingURL=icelandicLaw.d.ts.map