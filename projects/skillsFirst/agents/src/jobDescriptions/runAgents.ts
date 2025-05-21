// runAgents.ts

import { fileURLToPath } from "url";
import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
import { JobDescriptionAnalysisQueue } from "./analysisAgentQueue.js";
import { JobDescriptionAnalysisAgent } from "./analysisAgent.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";
import { PsGoogleSheetsConnector } from "@policysynth/agents/connectors/sheets/googleSheetsConnector.js";
import { PsGoogleDriveConnector } from "@policysynth/agents/connectors/drive/googleDrive.js";
import { SheetsComparisonAgent } from "./evals/compareSheets.js";
import { JobDescriptionCompareSheetsQueue } from "./evals/compareAgentQueue.js";
import { JobDescriptionRewriterAgent } from "./rewriterAgent.js";
import { JobDescriptionRewriterQueue } from "./rewriteAgentQueue.js";
import { JobTitleLicenseDegreeAnalysisQueue } from "./licenceDegrees/licenceAnalysisQueue.js";
import { JobTitleLicenseDegreeAnalysisAgent } from "./licenceDegrees/licenceAnalysisAgent.js";
import { CompareLicenseEducationQueue } from "./compareLicenseEducationQueue.js";
import { CompareLicenseEducationAgent } from "./compareLicenseEducationAgent.js";
export class JobDescriptionAgentRunner extends PsBaseAgentRunner {
  protected agentClasses: PsAgentClassCreationAttributes[];
  protected connectorClasses: PsAgentConnectorClassCreationAttributes[];

  constructor() {
    super();
    this.agentsToRun = [
      new JobDescriptionAnalysisQueue(),
      new JobDescriptionCompareSheetsQueue(),
      new JobDescriptionRewriterQueue(),
      new JobTitleLicenseDegreeAnalysisQueue(),
      new CompareLicenseEducationQueue(),
    ];

    this.agentClasses = [
      JobDescriptionAnalysisAgent.getAgentClass(),
      SheetsComparisonAgent.getAgentClass(),
      JobDescriptionRewriterAgent.getAgentClass(),
      JobTitleLicenseDegreeAnalysisAgent.getAgentClass(),
      CompareLicenseEducationAgent.getAgentClass(),
    ];

    this.connectorClasses = [
      PsGoogleDocsConnector.getConnectorClass,
      PsGoogleSheetsConnector.getConnectorClass,
      PsGoogleDriveConnector.getConnectorClass,
    ];
  }

  async setupAgents() {
    this.logger.info("Setting up Job Description Analysis agents");
    // Any additional setup specific to Job Description Analysis can be done here
  }

  static async runAgentManager() {
    try {
      const agentRunner = new JobDescriptionAgentRunner();
      await agentRunner.run();
    } catch (error) {
      console.error(
        "Error running Job Description Analysis Agent Manager:",
        error
      );
      throw error;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);

if (import.meta.url === `file://${__filename}`) {
  JobDescriptionAgentRunner.runAgentManager().catch((error) => {
    console.error(
      "Error running Job Description Analysis Agent Manager:",
      error
    );
    process.exit(1);
  });
}
