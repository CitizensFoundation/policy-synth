//TODO: Make agentRegistry secure with access control through communities/domains
//TODO: Make the angentRegistry support many instances of the agent classes running (counters?)
import { PolicySynthAgent } from "./agent.js";
import { PsAgentRegistry } from "../dbModels/agentRegistry.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAgentConnectorClass } from "../dbModels/agentConnectorClass.js";
import { initializeModels } from "../dbModels/index.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
export class PsBaseAgentRunner extends PolicySynthAgent {
    agentsToRun = [];
    agentRegistry = null;
    registeredAgentClasses = [];
    registeredConnectorClasses = [];
    constructor() {
        super({}, undefined, 0, 100);
        if (!process.env.YP_USER_ID_FOR_AGENT_CREATION) {
            throw new Error("YP_USER_ID_FOR_AGENT_CREATION environment variable not set");
        }
    }
    async setupAndRunAgents() {
        await connectToDatabase();
        await initializeModels();
        this.agentRegistry = await this.getOrCreateAgentRegistry();
        await this.createAgentClassesIfNeeded();
        await this.createConnectorClassesIfNeeded();
        await this.setupAgents();
        for (const agentQueue of this.agentsToRun) {
            this.logger.info(`Setting up agent: ${agentQueue.agentQueueName}`);
            await agentQueue.setupAgentQueue();
            await this.registerAgent(agentQueue);
            this.logger.info(`Agent ${agentQueue.agentQueueName} is ready and listening for jobs`);
        }
        await this.registerConnectors();
        this.logger.info("All agents and connectors are set up and running");
    }
    inspectDynamicMethods(obj, className) {
        console.log(`Inspecting methods for ${className}:`);
        const propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));
        propertyNames.forEach((name) => {
            const property = obj[name];
            if (typeof property === "function" && name !== "constructor") {
                console.log(`  - ${name}`);
            }
        });
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "function") {
                console.log(`  - ${key} (dynamically added)`);
            }
        });
    }
    async registerAgent(agentQueue) {
        if (!this.agentRegistry) {
            throw new Error("Agent registry not initialized");
        }
        const agentClassInfo = this.agentClasses.find((ac) => ac.configuration.queueName === agentQueue.agentQueueName);
        if (!agentClassInfo) {
            throw new Error(`Agent class information not found for ${agentQueue.agentQueueName}`);
        }
        const agentClass = await PsAgentClass.findOne({
            where: { class_base_id: agentClassInfo.class_base_id },
        });
        if (!agentClass) {
            throw new Error(`Agent class not found in database for ${agentClassInfo.name}`);
        }
        await this.agentRegistry.addAgent(agentClass);
        this.registeredAgentClasses.push(agentClass);
        this.logger.info(`Registered agent: ${agentClassInfo.name}`);
    }
    async registerConnectors() {
        if (!this.agentRegistry) {
            throw new Error("Agent registry not initialized");
        }
        for (const connectorClass of this.connectorClasses) {
            const connectorClassInstance = await PsAgentConnectorClass.findOne({
                where: {
                    class_base_id: connectorClass.class_base_id,
                    version: connectorClass.version
                },
            });
            if (!connectorClassInstance) {
                throw new Error(`Connector class not found in database for ${connectorClass.name}`);
            }
            await this.agentRegistry.addConnector(connectorClassInstance);
            this.registeredConnectorClasses.push(connectorClassInstance);
            this.logger.info(`Registered connector: ${connectorClass.name}`);
        }
    }
    async getOrCreateAgentRegistry() {
        const [registry, created] = await PsAgentRegistry.findOrCreate({
            where: {},
            defaults: {
                user_id: parseInt(process.env.YP_USER_ID_FOR_AGENT_CREATION),
                configuration: { supportedAgents: [] },
            },
        });
        if (created) {
            this.logger.info("Created new agent registry");
        }
        else {
            this.logger.info("Retrieved existing agent registry");
        }
        return registry;
    }
    async createAgentClassesIfNeeded() {
        for (const agentClass of this.agentClasses) {
            const [instance, created] = await PsAgentClass.findOrCreate({
                where: {
                    class_base_id: agentClass.class_base_id,
                    version: agentClass.version,
                },
                defaults: {
                    ...agentClass,
                    user_id: parseInt(process.env.YP_USER_ID_FOR_AGENT_CREATION),
                },
            });
            if (created) {
                this.logger.info(`Created agent class: ${instance.class_base_id} v${instance.version}`);
            }
        }
    }
    async createConnectorClassesIfNeeded() {
        for (const connectorClass of this.connectorClasses) {
            const [instance, created] = await PsAgentConnectorClass.findOrCreate({
                where: {
                    class_base_id: connectorClass.class_base_id,
                    version: connectorClass.version,
                },
                //@ts-ignore
                defaults: {
                    ...connectorClass,
                    user_id: parseInt(process.env.YP_USER_ID_FOR_AGENT_CREATION),
                },
            });
            if (created) {
                this.logger.info(`Created connector class: ${instance.class_base_id} v${instance.version}`);
            }
        }
    }
    async run() {
        try {
            this.setupGracefulShutdown();
            await this.setupAndRunAgents();
        }
        catch (error) {
            this.logger.error("Error running agents:", error);
        }
    }
    setupGracefulShutdown() {
        process.on("SIGINT", async () => {
            this.logger.info("Shutting down gracefully...");
            if (this.agentRegistry) {
                for (const agentClass of this.registeredAgentClasses) {
                    await this.agentRegistry.removeAgent(agentClass);
                    this.logger.info(`Unregistered agent: ${agentClass.name}`);
                }
                for (const connectorClass of this.registeredConnectorClasses) {
                    await this.agentRegistry.removeConnector(connectorClass);
                    this.logger.info(`Unregistered connector: ${connectorClass.name}`);
                }
            }
            process.exit(0);
        });
    }
}
//# sourceMappingURL=agentRunner.js.map