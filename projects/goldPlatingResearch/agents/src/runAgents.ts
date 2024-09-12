import { fileURLToPath } from "url";
import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
import { GoldPlatingResearchAgent } from "./goldPlatingResearchAgent.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";
import { PsYourPrioritiesConnector } from "@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js";
import { PsBaseDiscordConnector } from "@policysynth/agents/connectors/notifications/discordConnector.js";
import { PsGoogleSheetsConnector } from "@policysynth/agents/connectors/sheets/googleSheetsConnector.js";
import { GoldPlatingResearchQueue } from "./agentQueue.js";

export class GoldPlatingAgentRunner extends PsBaseAgentRunner {
  protected agentClasses: PsAgentClassCreationAttributes[];
  protected connectorClasses: PsAgentConnectorClassCreationAttributes[];

  constructor() {
    super();
    this.agentsToRun = [
      new GoldPlatingResearchQueue(),
    ];

    this.agentClasses = [
      GoldPlatingResearchAgent.getAgentClass(),
    ];

    this.connectorClasses = [
      PsGoogleDocsConnector.getConnectorClass,
      PsGoogleSheetsConnector.getConnectorClass
    ];
  }

  async setupAgents() {
    this.logger.info("Setting up Gold-Plating Research agents");
    // Any additional setup specific to Gold-Plating Research can be done here
  }

  static async runAgentManager() {
    try {
      const agentRunner = new GoldPlatingAgentRunner();
      await agentRunner.run();
    } catch (error) {
      console.error("Error running Gold-Plating Research Agent Manager:", error);
      throw error;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);

if (import.meta.url === `file://${__filename}`) {
  GoldPlatingAgentRunner.runAgentManager().catch((error) => {
    console.error("Error running Gold-Plating Research Agent Manager:", error);
    process.exit(1);
  });
}