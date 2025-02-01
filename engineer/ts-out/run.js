// runAgents.ts
import { fileURLToPath } from "url";
import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
import { PsEngineerAgentQueue } from "./queue.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";
import { PsGoogleSheetsConnector } from "@policysynth/agents/connectors/sheets/googleSheetsConnector.js";
import { PsGoogleDriveConnector } from "@policysynth/agents/connectors/drive/googleDrive.js";
import { PsEngineerAgent } from "./agent.js";
export class EngineerAgentRunner extends PsBaseAgentRunner {
    agentClasses;
    connectorClasses;
    constructor() {
        super();
        this.agentsToRun = [
            new PsEngineerAgentQueue(),
        ];
        this.agentClasses = [
            PsEngineerAgent.getAgentClass(),
        ];
        this.connectorClasses = [
            PsGoogleDocsConnector.getConnectorClass,
            PsGoogleSheetsConnector.getConnectorClass,
            PsGoogleDriveConnector.getConnectorClass,
        ];
    }
    async setupAgents() {
        this.logger.info("Setting up Engineer agents");
        // Any additional setup specific to Engineer can be done here
    }
    static async runAgentManager() {
        try {
            const agentRunner = new EngineerAgentRunner();
            await agentRunner.run();
        }
        catch (error) {
            console.error("Error running Engineer Agent Manager:", error);
            throw error;
        }
    }
}
const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === `file://${__filename}`) {
    EngineerAgentRunner.runAgentManager().catch((error) => {
        console.error("Error running Engineer Agent Manager:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=run.js.map