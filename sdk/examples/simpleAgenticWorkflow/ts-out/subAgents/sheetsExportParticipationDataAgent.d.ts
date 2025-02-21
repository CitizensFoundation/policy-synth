/**
 * subAgents/sheetsExportParticipationDataAgent.ts
 *
 * Sub-agent #3: Exports the final data (including analysis) to Google Sheets.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class SheetsExportParticipationDataAgent extends PolicySynthAgent {
    memory: ParticipationDataAnalysisMemory;
    private sheetsConnector;
    private sheetName;
    private readonly chunkSize;
    constructor(agent: PsAgent, memory: ParticipationDataAnalysisMemory, startProgress: number, endProgress: number, sheetName: string);
    /**
     * Main method to export data to Google Sheets.
     */
    process(): Promise<void>;
    private columnIndexToLetter;
}
//# sourceMappingURL=sheetsExportParticipationDataAgent.d.ts.map