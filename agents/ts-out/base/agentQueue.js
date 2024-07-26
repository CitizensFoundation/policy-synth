import ioredis from "ioredis";
import { PsAgent } from "../dbModels/agent.js";
import { Worker } from "bullmq";
import { PolicySynthAgent } from "./agent.js";
import { PsAgentConnector } from "../dbModels/agentConnector.js";
import { PsAgentConnectorClass } from "../dbModels/agentConnectorClass.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsExternalApiUsage } from "../dbModels/externalApiUsage.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAiModel } from "../dbModels/aiModel.js";
//TODO: Look to pool redis connections
const redis = new ioredis(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
export class PolicySynthAgentQueue extends PolicySynthAgent {
    status;
    skipCheckForProgress = true;
    constructor() {
        super({}, undefined, 0, 100);
        this.startProgress = 0;
        this.endProgress = 100;
    }
    async loadAgentStatusFromRedis() {
        try {
            const statusDataString = await this.redis.get(this.agent.redisStatusKey);
            if (statusDataString) {
                this.status = JSON.parse(statusDataString);
            }
            else {
                console.error(`No status data found for agent ${this.agent.id} ${this.agent.redisStatusKey}`);
            }
        }
        catch (error) {
            this.logger.error("Error initializing agent memory");
            this.logger.error(error);
        }
        return this.status;
    }
    async saveAgentStatusToRedis() {
        if (this.status) {
            await this.redis.set(this.agent.redisStatusKey, JSON.stringify(this.status));
            this.logger.debug("Saved status to Redis for:" + this.agent.redisStatusKey);
            this.logger.debug(`Status: ${JSON.stringify(this.status, null, 2)}`);
        }
        else {
            this.logger.error("Agent status not initialized");
        }
    }
    async setupStatusIfNeeded() {
        this.logger.info("Setting up agent status");
        await this.loadAgentStatusFromRedis();
        if (!this.status) {
            this.logger.error(`No status found for agent ${this.agent.id} reseting`);
            this.status = {
                state: "running",
                progress: 0,
                messages: [],
                lastUpdated: Date.now(),
            };
            this.logger.debug("Initialized agent status");
            await this.saveAgentStatusToRedis();
        }
    }
    async processAllAgents() {
        let totalProgress = 0;
        for (let i = 0; i < this.processors.length; i++) {
            const { processor: Agent, weight } = this.processors[i];
            const startProgress = totalProgress;
            const endProgress = totalProgress + weight;
            try {
                const processorInstance = new Agent(this.agent, this.memory, startProgress, endProgress);
                await processorInstance.process();
                totalProgress = endProgress;
                await this.updateProgress(totalProgress, `${Agent.name} completed`);
            }
            catch (error) {
                throw error;
            }
        }
    }
    async setupAgentQueue() {
        if (this.agentQueueName) {
            const worker = new Worker(this.agentQueueName, async (job) => {
                try {
                    const data = job.data;
                    const loadedAgent = await PsAgent.findByPk(data.agentId, {
                        include: [
                            {
                                model: PsAgent,
                                as: "SubAgents",
                                include: [
                                    {
                                        model: PsAgentConnector,
                                        as: "InputConnectors",
                                        include: [
                                            {
                                                model: PsAgentConnectorClass,
                                                as: "Class",
                                            },
                                        ],
                                    },
                                    {
                                        model: PsAgentConnector,
                                        as: "OutputConnectors",
                                        include: [
                                            {
                                                model: PsAgentConnectorClass,
                                                as: "Class",
                                            },
                                        ],
                                    },
                                    { model: PsAgentClass, as: "Class" },
                                ],
                            },
                            {
                                model: PsAgentConnector,
                                as: "InputConnectors",
                                include: [
                                    {
                                        model: PsAgentConnectorClass,
                                        as: "Class",
                                    },
                                ],
                            },
                            {
                                model: PsAgentConnector,
                                as: "OutputConnectors",
                                include: [
                                    {
                                        model: PsAgentConnectorClass,
                                        as: "Class",
                                    },
                                ],
                            },
                            { model: PsAgentClass, as: "Class" },
                            { model: User, as: "User" },
                            { model: Group, as: "Group" },
                            { model: PsExternalApiUsage, as: "ExternalApiUsage" },
                            { model: PsModelUsage, as: "ModelUsage" },
                            { model: PsAiModel, as: "AiModels" },
                        ],
                    });
                    if (loadedAgent) {
                        this.logger.debug(`Agent group config: ${loadedAgent.group_id}`);
                        this.logger.debug(`Agent group config: ${loadedAgent.Group?.configuration}`);
                        this.agent = loadedAgent;
                        await this.loadAgentMemoryFromRedis();
                        await this.setupMemoryIfNeeded();
                        await this.loadAgentStatusFromRedis();
                        await this.setupStatusIfNeeded();
                        switch (data.action) {
                            case "start":
                                await this.startAgent();
                                break;
                            case "stop":
                                await this.stopAgent();
                                break;
                            case "pause":
                                await this.pauseAgent();
                                break;
                            default:
                                throw new Error(`Unknown action ${data.action} for job ${job.id}`);
                        }
                    }
                    else {
                        throw new Error(`Agent not found for job ${job.id}`);
                    }
                }
                catch (error) {
                    throw error;
                }
            }, {
                connection: {
                    host: redis.options.host,
                    port: redis.options.port,
                    maxRetriesPerRequest: null,
                },
                concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
                maxStalledCount: 0,
            });
            worker.on("completed", (job) => {
                this.logger.info(`Job ${job.id} has been completed for agent ${this.agentQueueName}`);
            });
            worker.on("failed", (job, err) => {
                this.logger.error(`Job ${job?.id || "unknown"} has failed for agent ${this.agentQueueName}`, err);
            });
            worker.on("error", (err) => {
                this.logger.error(`An error occurred in the worker for agent ${this.agentQueueName}`, err);
                this.updateAgentStatus("error", err.message);
            });
            worker.on("active", (job) => {
                this.logger.info(`Job ${job.id} has started processing for agent ${this.agentQueueName}`);
            });
            worker.on("stalled", (jobId) => {
                this.logger.warn(`Job ${jobId} has been stalled for agent ${this.agentQueueName}`);
            });
            this.logger.info(`Worker set up successfully for agent ${this.agentQueueName}`);
        }
        else {
            this.logger.error("Top level agent queue name not set");
        }
    }
    async startAgent() {
        this.logger.info(`Starting agent ${this.agent.id}`);
        try {
            await this.updateAgentStatus("running");
            await this.processAllAgents();
        }
        catch (error) {
            throw error;
        }
    }
    async stopAgent() {
        this.logger.info(`Stopping agent ${this.agent.id}`);
        await this.updateAgentStatus("stopped");
    }
    async pauseAgent() {
        this.logger.info(`Pausing agent ${this.agent.id}`);
        await this.updateAgentStatus("paused");
    }
    async updateAgentStatus(state, message) {
        //TODO: Look into moving status into the agent db object so we can update with transactions
        await this.loadStatusFromRedis();
        if (this.agent && this.status) {
            this.status.state = state;
            this.status.messages.push(message || `Agent ${this.agent.id} is now ${state}`);
            this.logger.info(`Agent ${this.agent.id} is now ${state}`);
            await this.saveAgentStatusToRedis();
        }
        else {
            this.logger.error("Agent or agent memory not initialized");
        }
    }
}
//# sourceMappingURL=agentQueue.js.map