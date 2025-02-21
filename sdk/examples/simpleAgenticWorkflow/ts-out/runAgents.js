// runAgents.ts
import { fileURLToPath } from "url";
import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
import { ParticipationDataAnalysisQueue } from "./participationAgentQueue.js";
import { ParticipationDataAnalysisAgent } from "./participationAgent.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";
import { PsGoogleSheetsConnector } from "@policysynth/agents/connectors/sheets/googleSheetsConnector.js";
import { PsGoogleDriveConnector } from "@policysynth/agents/connectors/drive/googleDrive.js";
export class ParticipationDataAnalysisAgentRunner extends PsBaseAgentRunner {
    agentClasses;
    connectorClasses;
    constructor() {
        super();
        this.agentsToRun = [
            new ParticipationDataAnalysisQueue(),
        ];
        this.agentClasses = [
            ParticipationDataAnalysisAgent.getAgentClass(),
        ];
        this.connectorClasses = [
            PsGoogleDocsConnector.getConnectorClass,
            PsGoogleSheetsConnector.getConnectorClass,
            PsGoogleDriveConnector.getConnectorClass,
        ];
    }
    async setupAgents() {
        this.logger.info("Setting up Participation Data Analysis agents");
        // Any additional setup specific to Participation Data Analysis can be done here
    }
    static async runAgentManager() {
        try {
            const agentRunner = new ParticipationDataAnalysisAgentRunner();
            await agentRunner.run();
        }
        catch (error) {
            console.error("Error running Participation Data Analysis Agent Manager:", error);
            throw error;
        }
    }
}
const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === `file://${__filename}`) {
    ParticipationDataAnalysisAgentRunner.runAgentManager().catch((error) => {
        console.error("Error running Participation Data Analysis Agent Manager:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=runAgents.js.map