import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class XlsReportAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    private sheetsConnector;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private collectArticles;
    private generateReport;
    private generateSummarySheet;
    private sanitizeData;
    private generateDetailedFindingsSheet;
    private translateSource;
}
//# sourceMappingURL=sheetReport.d.ts.map