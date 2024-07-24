import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { PsAgent, PsAgentClass } from "../dbModels/index.js";
export class AgentQueueManager {
    redisClient;
    queues;
    constructor() {
        this.initializeRedis();
        this.queues = new Map();
    }
    initializeRedis() {
        this.redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
            tls: process.env.REDIS_URL ? { rejectUnauthorized: false } : undefined,
        });
        this.redisClient.on("error", (err) => console.error("Redis Client Error", err));
    }
    getQueue(queueName) {
        if (!this.queues.has(queueName)) {
            const newQueue = new Queue(queueName, {
                connection: this.redisClient,
            });
            this.queues.set(queueName, newQueue);
        }
        return this.queues.get(queueName);
    }
    async controlAgent(agentId, action) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAgentClass, as: "Class" }],
        });
        if (!agent || !agent.Class) {
            throw new Error("Agent or Agent Class not found");
        }
        const queueName = agent.Class.configuration.queueName;
        if (!queueName) {
            throw new Error("Queue name not defined for this agent class");
        }
        const queue = this.getQueue(queueName);
        await queue.add(`${action}Agent`, { agentId, action });
        return `${action.charAt(0).toUpperCase() + action.slice(1)} request for agent ${agentId} queued in ${queueName}`;
    }
    async startAgentProcessing(agentId) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAgentClass, as: "Class" }],
        });
        if (!agent || !agent.Class)
            return false;
        const queueName = agent.Class.configuration.queueName;
        const queue = this.getQueue(queueName);
        await queue.add("control-message", {
            type: "start-processing",
            agentId: agent.id,
        });
        await this.updateAgentStatus(agent.id, "running");
        return true;
    }
    async pauseAgentProcessing(agentId) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAgentClass, as: "Class" }],
        });
        if (!agent || !agent.Class)
            return false;
        const queueName = agent.Class.configuration.queueName;
        const queue = this.getQueue(queueName);
        await queue.add("control-message", {
            type: "pause-processing",
            agentId: agent.id,
        });
        await this.updateAgentStatus(agent.id, "paused");
        return true;
    }
    async getAgentStatus(agentId) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAgentClass, as: "Class" }],
        });
        if (agent) {
            const statusDataString = await this.redisClient.get(agent.redisStatusKey);
            if (statusDataString) {
                const statusData = JSON.parse(statusDataString);
                return statusData;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
    async updateAgentStatus(agentId, state, progress, message, details) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAgentClass, as: "Class" }],
        });
        if (agent) {
            const statusDataString = await this.redisClient.get(agent.redisStatusKey);
            if (statusDataString) {
                const statusData = JSON.parse(statusDataString);
                statusData.state = state;
                statusData.lastUpdated = Date.now();
                if (progress !== undefined)
                    statusData.progress = progress;
                if (message)
                    statusData.messages.push(message);
                if (details)
                    statusData.details = {
                        ...statusData.details,
                        ...details,
                    };
                await this.redisClient.set(agent.redisStatusKey, JSON.stringify(statusData));
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
}
//# sourceMappingURL=agentQueueManager.js.map