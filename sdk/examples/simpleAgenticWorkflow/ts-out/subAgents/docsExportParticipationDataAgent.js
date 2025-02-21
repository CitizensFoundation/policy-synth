/**
 * subAgents/docsExportParticipationDataAgent.ts
 *
 * Sub-agent #4: Exports the final summary report to Google Docs.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
export class DocsExportParticipationDataAgent extends PolicySynthAgent {
    docsConnector;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
        this.docsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Document, false);
        if (!this.docsConnector) {
            throw new Error("Google Docs connector not found");
        }
    }
    /**
     * Exports the memory.fullReportOnAllItems to Google Docs.
     */
    async process() {
        await this.updateRangedProgress(0, "Starting export to Google Docs");
        const reportMarkdown = this.memory.fullReportOnAllItems || "No summary available.";
        // Convert or pass the markdown to the docs connector.
        // (Implementation depends on your environment; some connectors accept raw text, others accept HTML.)
        await this.docsConnector.updateDocument(reportMarkdown);
        await this.updateRangedProgress(100, "Exported summary report to Google Docs");
        await this.setCompleted("Docs export completed");
    }
}
//# sourceMappingURL=docsExportParticipationDataAgent.js.map