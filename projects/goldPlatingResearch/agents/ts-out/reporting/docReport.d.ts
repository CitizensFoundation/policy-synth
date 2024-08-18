import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class GoogleDocsReportAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    private docsConnector;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private collectAndRankArticles;
    private generateReportContent;
    private generateExecutiveSummary;
    private generateDetailedFindings;
    private generateConclusion;
}
//# sourceMappingURL=docReport.d.ts.map