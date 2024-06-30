import { ProblemsAgentQueue } from "./problems/problemsAgent.js";
import { RootCausesAgentQueue } from "./problems/rootCausesAgent.js";
import { SolutionsWebResearchAgentQueue } from "./solutions/solutionsWebResearch.js";
import { SolutionsEvolutionAgentQueue } from "./solutions/solutionsEvolution.js";
import { PoliciesAgentQueue } from "./policies/policies.js";
import { PolicySynthOperationsAgent } from "../../base/operationsAgent.js";
import { ProblemsSmarterCrowdsourcingAgent } from "./base/scBaseProblemsAgent.js";
import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "./base/scBaseSolutionsEvolutionAgent.js";
import { PoliciesSmarterCrowdsourcingAgent } from "./base/scBasePoliciesAgent.js";
import { PsAgentClass } from "../../dbModels/agentClass.js";
import { RootCausesSmarterCrowdsourcingAgent } from "./base/scBaseRootCausesAgent.js";
import { SolutionsWebResearchSmarterCrowdsourcingAgent } from "./base/scBaseSolutionsWebResearchAgent.js";
import { fileURLToPath } from "url";
import path from "path";
import { connectToDatabase } from "../../dbModels/sequelize.js";
import { PsAgentConnectorClass, initializeModels } from "../../dbModels/index.js";
import { PsGoogleDocsConnector } from "../../connectors/documents/googleDocsConnector.js";
import { PsYourPrioritiesConnector } from "../../connectors/collaboration/yourPrioritiesConnector.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class AgentManager extends PolicySynthOperationsAgent {
    agentsToRun = [
        ProblemsAgentQueue,
        RootCausesAgentQueue,
        SolutionsWebResearchAgentQueue,
        SolutionsEvolutionAgentQueue,
        PoliciesAgentQueue,
    ];
    constructor() {
        super({}, undefined, 0, 100);
    }
    static async createAgentClassesIfNeeded(userId) {
        const agentClasses = [
            RootCausesSmarterCrowdsourcingAgent.getAgentClass(),
            ProblemsSmarterCrowdsourcingAgent.getAgentClass(),
            SolutionsWebResearchSmarterCrowdsourcingAgent.getAgentClass(),
            SolutionsEvolutionSmarterCrowdsourcingAgent.getAgentClass(),
            PoliciesSmarterCrowdsourcingAgent.getAgentClass(),
        ];
        for (const agentClass of agentClasses) {
            const [instance, created] = await PsAgentClass.findOrCreate({
                where: {
                    class_base_id: agentClass.class_base_id,
                    version: agentClass.version,
                },
                defaults: {
                    ...agentClass,
                    user_id: userId,
                },
            });
            if (created) {
                console.log(`Created agent class: ${instance.class_base_id} v${instance.version}`);
            }
        }
    }
    static async createConnectorClasses(userId) {
        const connectorClasses = [
            PsGoogleDocsConnector.getConnectorClass,
            PsYourPrioritiesConnector.getConnectorClass,
        ];
        for (const connectorClass of connectorClasses) {
            const [instance, created] = await PsAgentConnectorClass.findOrCreate({
                where: {
                    class_base_id: connectorClass.class_base_id,
                    version: connectorClass.version,
                },
                //@ts-ignore
                defaults: {
                    ...connectorClass,
                    user_id: userId,
                },
            });
            if (created) {
                console.log(`Created connector class: ${instance.class_base_id} v${instance.version}`);
            }
        }
    }
    async setupAndRunAgents() {
        await connectToDatabase();
        await initializeModels();
        //TODO: Make this more elegant but using user_id=1 for now
        await AgentManager.createAgentClassesIfNeeded(1);
        await AgentManager.createConnectorClasses(1);
        for (const AgentClass of this.agentsToRun) {
            const agent = new AgentClass();
            this.logger.info(`Setting up agent: ${agent.agentQueueName}`);
            await agent.setupAgentQueue();
            this.logger.info(`Agent ${agent.agentQueueName} is ready and listening for jobs`);
        }
        this.logger.info("All agents are set up and running");
    }
    setupGracefulShutdown() {
        process.on("SIGINT", async () => {
            this.logger.info("Shutting down gracefully...");
            // Add any cleanup logic here if needed
            process.exit(0);
        });
    }
    async run() {
        try {
            await this.setupAndRunAgents();
            this.setupGracefulShutdown();
        }
        catch (error) {
            this.logger.error("Error setting up agents:", error);
            process.exit(1);
        }
    }
}
async function runAgentManager() {
    const agentManager = new AgentManager();
    await agentManager.run();
}
if (import.meta.url === `file://${__filename}`) {
    await runAgentManager();
}
export { runAgentManager };
//# sourceMappingURL=runAgents.js.map