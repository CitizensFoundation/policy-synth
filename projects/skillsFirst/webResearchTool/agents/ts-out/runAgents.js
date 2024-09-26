// runAgents.ts
import { fileURLToPath } from "url";
import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
import { JobDescriptionAnalysisQueue } from "./agentQueue.js";
import { JobDescriptionAnalysisAgent } from "./jobDescriptionAgent.js";
export class JobDescriptionAgentRunner extends PsBaseAgentRunner {
    agentClasses;
    connectorClasses;
    constructor() {
        super();
        this.agentsToRun = [new JobDescriptionAnalysisQueue()];
        this.agentClasses = [JobDescriptionAnalysisAgent.getAgentClass()];
        this.connectorClasses = [
        // Add any connector classes if needed
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