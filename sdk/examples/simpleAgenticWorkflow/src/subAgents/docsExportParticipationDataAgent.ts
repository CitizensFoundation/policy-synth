/**
 * subAgents/docsExportParticipationDataAgent.ts
 *
 * Sub-agent #4: Exports the final summary report to Google Docs.
 */

import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";

export class DocsExportParticipationDataAgent extends PolicySynthAgent {
  declare memory: ParticipationDataAnalysisMemory;
  private docsConnector: PsGoogleDocsConnector;

  constructor(
    agent: PsAgent,
    memory: ParticipationDataAnalysisMemory,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;

    this.docsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Document,
      false
    ) as PsGoogleDocsConnector;

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
