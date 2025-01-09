// agentQueue.ts
import ioredis from "ioredis";
import { QueueEvents, Worker } from "bullmq";
import { PolicySynthAgent } from "./agent.js";
import { PsAgentConnector } from "../dbModels/agentConnector.js";
import { PsAgentConnectorClass } from "../dbModels/agentConnectorClass.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsExternalApiUsage } from "../dbModels/externalApiUsage.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { PsAgent } from "../dbModels/agent.js";
/**
 * Abstract queue that can hold multiple agent implementations
 * This class has been refactored to store multiple Agents in maps
 */
export class PolicySynthAgentQueue extends PolicySynthAgent {
    // Instead of single references, we keep them in maps keyed by agentId
    agentsMap = new Map();
    agentInstancesMap = new Map();
    agentStatusMap = new Map();
    /**
     * NEW: We also keep a memory map so each agentId can have its own memory,
     * and we can inject structuredAnswersOverrides there.
     */
    agentMemoryMap = new Map();
    structuredAnswersOverrides;
    skipCheckForProgress = true;
    redisClient;
    constructor() {
        // We pass a dummy agent to the super since we must call `super()`
        // The rest of the code is adjusted so we rarely use `this.agent` in this queue class
        super({}, undefined, 0, 100);
        this.initializeRedis();
    }
    initializeRedis() {
        let redisUrl = process.env.REDIS_AGENT_URL || process.env.REDIS_URL || "redis://localhost:6379";
        // Handle 'redis://h:' case if needed
        if (redisUrl.startsWith("redis://h:")) {
            redisUrl = redisUrl.replace("redis://h:", "redis://:");
        }
        console.log("AgentQueueManager: Initializing Redis connection:", redisUrl);
        const options = {
            maxRetriesPerRequest: null,
            tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
        };
        this.redisClient = new ioredis(redisUrl, options);
        this.redisClient.on("error", (err) => {
            console.error("Redis Client Error", err);
        });
        this.redisClient.on("connect", () => {
            console.log("AgentQueueManager: Successfully connected to Redis");
        });
        this.redisClient.on("reconnecting", () => {
            console.log("AgentQueueManager: Redis client is reconnecting");
        });
        this.redisClient.on("ready", () => {
            console.log("AgentQueueManager: Redis client is ready");
        });
    }
    // Retrieve or load PsAgent from DB
    async getOrCreatePsAgent(agentId) {
        let psAgent = this.agentsMap.get(agentId);
        if (!psAgent) {
            // We fetch from DB
            psAgent = (await PsAgent.findByPk(agentId, {
                include: [
                    {
                        model: PsAgent,
                        as: "SubAgents",
                        include: [
                            {
                                model: PsAgentConnector,
                                as: "InputConnectors",
                                include: [{ model: PsAgentConnectorClass, as: "Class" }],
                            },
                            {
                                model: PsAgentConnector,
                                as: "OutputConnectors",
                                include: [{ model: PsAgentConnectorClass, as: "Class" }],
                            },
                            { model: PsAgentClass, as: "Class" },
                        ],
                    },
                    {
                        model: PsAgentConnector,
                        as: "InputConnectors",
                        include: [{ model: PsAgentConnectorClass, as: "Class" }],
                    },
                    {
                        model: PsAgentConnector,
                        as: "OutputConnectors",
                        include: [{ model: PsAgentConnectorClass, as: "Class" }],
                    },
                    { model: PsAgentClass, as: "Class" },
                    {
                        model: User,
                        as: "User",
                        attributes: ["id", "email", "name"],
                    },
                    {
                        model: Group,
                        as: "Group",
                        attributes: [
                            "id",
                            "user_id",
                            "configuration",
                            "name",
                            "private_access_configuration",
                        ],
                    },
                    { model: PsExternalApiUsage, as: "ExternalApiUsage" },
                    { model: PsModelUsage, as: "ModelUsage" },
                    { model: PsAiModel, as: "AiModels" },
                ],
            }));
            if (!psAgent) {
                throw new Error(`Agent not found in DB for agentId=${agentId}`);
            }
            this.agentsMap.set(agentId, psAgent);
        }
        return psAgent;
    }
    /**
     * Retrieve or create the actual PolicySynthAgent instance.
     * Now we pass the memory from agentMemoryMap to the constructor,
     * so we always have an object with structuredAnswersOverrides set.
     */
    getOrCreateAgentInstance(agentId) {
        let policySynthAgent = this.agentInstancesMap.get(agentId);
        if (!policySynthAgent) {
            const psAgent = this.agentsMap.get(agentId);
            if (!psAgent) {
                throw new Error(`PsAgent object not found in agentsMap for agentId=${agentId}`);
            }
            // We'll take the first processor’s weight as an example, or pass 0/100
            const startProgress = 0;
            const endProgress = 100;
            // Ensure we have a memory object for this agent
            let agentMemory = this.agentMemoryMap.get(agentId);
            if (!agentMemory) {
                agentMemory = { agentId };
                this.agentMemoryMap.set(agentId, agentMemory);
            }
            // By default, pick your first processor
            const firstProcessorClass = this.processors[0].processor;
            policySynthAgent = new firstProcessorClass(psAgent, agentMemory, startProgress, endProgress);
            this.agentInstancesMap.set(agentId, policySynthAgent);
        }
        return policySynthAgent;
    }
    // If you want multiple processor steps in sequence:
    async processAllAgents(agentId) {
        let totalProgress = 0;
        for (let i = 0; i < this.processors.length; i++) {
            const { processor: AgentClass, weight } = this.processors[i];
            const startProgress = totalProgress;
            const endProgress = totalProgress + weight;
            totalProgress = endProgress;
            try {
                const psAgent = this.agentsMap.get(agentId);
                if (!psAgent) {
                    throw new Error(`PsAgent not loaded for agentId=${agentId}`);
                }
                // Make sure the memory is the same one we've stored
                let agentMemory = this.agentMemoryMap.get(agentId);
                if (!agentMemory) {
                    agentMemory = { agentId };
                    this.agentMemoryMap.set(agentId, agentMemory);
                }
                const policySynthAgent = new AgentClass(psAgent, agentMemory, startProgress, endProgress);
                this.agentInstancesMap.set(agentId, policySynthAgent);
                await policySynthAgent.process();
            }
            catch (error) {
                throw error;
            }
        }
    }
    async loadAgentStatusFromRedis(agentId) {
        const psAgent = this.agentsMap.get(agentId);
        if (!psAgent)
            return undefined;
        try {
            const statusDataString = await this.redisClient.get(psAgent.redisStatusKey);
            if (statusDataString) {
                const status = JSON.parse(statusDataString);
                this.agentStatusMap.set(agentId, status);
                return status;
            }
            else {
                console.error(`No status data found for agent ${agentId} ${psAgent.redisStatusKey}`);
            }
        }
        catch (error) {
            this.logger.error("Error initializing agent status", error);
        }
        return undefined;
    }
    async saveAgentStatusToRedis(agentId) {
        const psAgent = this.agentsMap.get(agentId);
        if (!psAgent)
            return;
        const status = this.agentStatusMap.get(agentId);
        if (!status) {
            this.logger.error(`Agent status not found for agentId=${agentId}`);
            return;
        }
        await this.redisClient.set(psAgent.redisStatusKey, JSON.stringify(status));
        this.logger.debug("Saved status to Redis for:" + psAgent.redisStatusKey);
        this.logger.debug(`Status: ${JSON.stringify(status, null, 2)}`);
    }
    async setupStatusIfNeeded(agentId) {
        this.logger.info(`Setting up agent status for agentId=${agentId}`);
        await this.loadAgentStatusFromRedis(agentId);
        const status = this.agentStatusMap.get(agentId);
        if (!status) {
            this.logger.error(`No status found for agent ${agentId}, resetting`);
            const newStatus = {
                state: "running",
                progress: 0,
                messages: [],
                lastUpdated: Date.now(),
            };
            this.agentStatusMap.set(agentId, newStatus);
            await this.saveAgentStatusToRedis(agentId);
        }
    }
    async setupAgentQueue() {
        if (this.agentQueueName) {
            console.log(`Setting up worker for agentQueue ${this.agentQueueName}`);
            const worker = new Worker(this.agentQueueName, async (job) => {
                try {
                    console.log(`Processing job ${job.id} for agentQueue ${this.agentQueueName}`);
                    const data = job.data;
                    const { agentId, action, structuredAnswersOverrides } = data;
                    // 1) Ensure PsAgent is loaded from DB
                    const loadedAgent = await this.getOrCreatePsAgent(agentId);
                    // 2) Make sure we have a memory object for this agent
                    let agentMemory = this.agentMemoryMap.get(agentId);
                    if (!agentMemory) {
                        agentMemory = { agentId };
                        this.agentMemoryMap.set(agentId, agentMemory);
                    }
                    // 3) If we want to store structuredAnswersOverrides, do so here
                    if (structuredAnswersOverrides) {
                        this.structuredAnswersOverrides = structuredAnswersOverrides;
                        agentMemory.structuredAnswersOverrides = structuredAnswersOverrides;
                    }
                    // 4) Run any subclass-specific memory setup
                    await this.setupMemoryIfNeeded(agentId);
                    // 5) Setup status
                    await this.setupStatusIfNeeded(agentId);
                    // 6) Log the action
                    console.log(`${action} agent ${loadedAgent.id} with structured answers overrides:`, JSON.stringify(structuredAnswersOverrides));
                    // 7) Actually start/stop/pause
                    switch (action) {
                        case "start":
                            await this.startAgent(agentId);
                            break;
                        case "stop":
                            await this.stopAgent(agentId);
                            break;
                        case "pause":
                            await this.pauseAgent(agentId);
                            break;
                        default:
                            throw new Error(`Unknown action ${action} for job ${job.id}`);
                    }
                }
                catch (error) {
                    throw error;
                }
            }, {
                connection: this.redisClient,
                concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "20"),
                maxStalledCount: 0,
            });
            worker.on("completed", (job) => {
                this.logger.info(`Job ${job.id} has been completed for queue ${this.agentQueueName}`);
            });
            worker.on("failed", (job, err) => {
                this.logger.error(`Job ${job?.id || "unknown"} failed for ${this.agentQueueName}`, err);
            });
            worker.on("error", (err) => {
                this.logger.error(`An error occurred in the worker for ${this.agentQueueName}`, err);
                // If needed, set status to error:
                // this.updateAgentStatus(agentId, "error", err.message);
            });
            worker.on("active", (job) => {
                this.logger.info(`Job ${job.id} started processing for ${this.agentQueueName}`);
            });
            worker.on("stalled", (jobId) => {
                this.logger.warn(`Job ${jobId} has been stalled for ${this.agentQueueName}`);
            });
            // Optional: queueEvents for global monitoring
            const queueEvents = new QueueEvents(this.agentQueueName, {
                connection: {
                    host: this.redisClient.options.host,
                    port: this.redisClient.options.port,
                },
            });
            queueEvents.on("waiting", ({ jobId }) => {
                this.logger.debug(`Job ${jobId} is waiting in queue ${this.agentQueueName}`);
            });
            queueEvents.on("progress", ({ jobId, data }) => {
                this.logger.debug(`Job ${jobId} reported progress: ${data}`);
            });
            queueEvents.on("drained", () => {
                this.logger.debug(`Queue ${this.agentQueueName} was drained`);
            });
            queueEvents.on("removed", ({ jobId }) => {
                this.logger.debug(`Job ${jobId} was removed from queue ${this.agentQueueName}`);
            });
            this.logger.info(`Worker set up successfully for agentQueue ${this.agentQueueName}`);
        }
        else {
            this.logger.error("Top level agent queue name not set");
        }
    }
    // Below are the methods that change the status of an agent by agentId
    async startAgent(agentId) {
        this.logger.info(`Starting agent ${agentId}`);
        await this.updateAgentStatus(agentId, "running");
        // Optionally call processAllAgents if you have multiple steps:
        await this.processAllAgents(agentId);
    }
    async stopAgent(agentId) {
        this.logger.info(`Stopping agent ${agentId}`);
        await this.updateAgentStatus(agentId, "stopped");
    }
    async pauseAgent(agentId) {
        this.logger.info(`Pausing agent ${agentId}`);
        await this.updateAgentStatus(agentId, "paused");
    }
    async updateAgentStatus(agentId, state, message) {
        const status = this.agentStatusMap.get(agentId);
        if (!status) {
            this.logger.error(`No status found for agentId=${agentId}`);
            return;
        }
        status.state = state;
        status.messages.push(message || `Agent ${agentId} is now ${state}`);
        status.lastUpdated = Date.now();
        this.logger.info(`Agent ${agentId} is now ${state}`);
        await this.saveAgentStatusToRedis(agentId);
    }
}
//# sourceMappingURL=agentQueue.js.map