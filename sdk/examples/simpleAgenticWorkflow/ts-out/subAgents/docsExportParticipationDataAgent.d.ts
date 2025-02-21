/**
 * subAgents/docsExportParticipationDataAgent.ts
 *
 * Sub-agent #4: Exports the final summary report to Google Docs.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class DocsExportParticipationDataAgent extends PolicySynthAgent {
    memory: ParticipationDataAnalysisMemory;
    private docsConnector;
    constructor(agent: PsAgent, memory: ParticipationDataAnalysisMemory, startProgress: number, endProgress: number);
    /**
     * Exports the memory.fullReportOnAllItems to Google Docs.
     */
    process(): Promise<void>;
}
//# sourceMappingURL=docsExportParticipationDataAgent.d.ts.map