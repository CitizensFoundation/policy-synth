import { CreateRootCausesSearchQueriesAgent } from "./create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesAgent } from "./web/getRootCausesWebPages.js";
import { SearchWebForRootCausesAgent } from "./web/searchWebForRootCauses.js";
import { RankRootCausesSearchQueriesAgent } from "./ranking/rankRootCausesSearchQueries.js";
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { RankRootCausesSearchResultsAgent } from "./ranking/rankRootCausesSearchResults.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

export class RootCausesAgentQueue extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;
  private sheetsConnector: PsBaseSheetConnector | null = null;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_ROOT_CAUSES;
  }

  async setupMemoryIfNeeded(agentId: number) {
    if (!this.memory || !this.memory.subProblems) {
      this.logger.info(`Setting up memory for agent ${agentId}`);
      const psAgent = await this.getOrCreatePsAgent(agentId);
      this.memory = emptySmarterCrowdsourcingMemory(
        psAgent.group_id,
        psAgent.id
      );
    }
    await this.initializeConnectors(agentId);
  }

  private async initializeConnectors(agentId: number) {
    const psAgent = await this.getOrCreatePsAgent(agentId);
    this.sheetsConnector = PsConnectorFactory.getConnector(
      psAgent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      this.logger.error("Sheets connector not found");
      psAgent.OutputConnectors?.forEach((connector) => {
        this.logger.error(`Output connector: ${connector.Class?.name}`);
      });
    }
  }

  get processors() {
    return [
      { processor: CreateRootCausesSearchQueriesAgent, weight: 10 },
      { processor: RankRootCausesSearchQueriesAgent, weight: 10 },
      { processor: SearchWebForRootCausesAgent, weight: 10 },
      { processor: RankRootCausesSearchResultsAgent, weight: 30 },
      { processor: GetRootCausesWebPagesAgent, weight: 40 },
    ];
  }

  async exportSubproblemsToSheet() {
    if (!this.sheetsConnector) {
      this.logger.warn("Google Sheets connector not initialized");
      return;
    }

    const headers = [
      "Title",
      "Description",
      "Why Important",
      "Short Description",
      "Year Published",
      "Elo Rating",
      "From Search Type",
      "From URL",
    ];

    const subproblemsData = this.memory.subProblems.map((subproblem) => [
      subproblem.title,
      subproblem.description,
      subproblem.whyIsSubProblemImportant,
      subproblem.shortDescriptionForPairwiseRanking || "",
      subproblem.yearPublished?.toString() || "",
      subproblem.eloRating?.toString() || "",
      subproblem.fromSearchType || "",
      subproblem.fromUrl || "",
    ]);

    const dataToExport = [headers, ...subproblemsData];

    try {
      await this.sheetsConnector.updateSheet(dataToExport);
      this.logger.info("Subproblems exported to Google Sheets successfully");
    } catch (error) {
      this.logger.error("Error exporting subproblems to Google Sheets", error);
    }
  }
}