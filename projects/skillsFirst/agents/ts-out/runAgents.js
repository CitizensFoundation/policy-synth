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
export class JobDescriptionAgentRunner extends PsBaseAgentRunner {
    agentClasses;
    connectorClasses;
    constructor() {
        super();
        this.agentsToRun = [
            new JobDescriptionAnalysisQueue(),
            new JobDescriptionCompareSheetsQueue(),
        ];
        this.agentClasses = [
            JobDescriptionAnalysisAgent.getAgentClass(),
            SheetsComparisonAgent.getAgentClass(),
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
        }
        catch (error) {
            console.error("Error running Job Description Analysis Agent Manager:", error);
            throw error;
        }
    }
}
const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === `file://${__filename}`) {
    JobDescriptionAgentRunner.runAgentManager().catch((error) => {
        console.error("Error running Job Description Analysis Agent Manager:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=runAgents.js.map