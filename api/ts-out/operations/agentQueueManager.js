import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { PsAgent, PsAgentClass, } from "../models/index.js";
export class AgentQueueManager {
    redisClient;
    queues;
    constructor() {
        this.initializeRedis();
        this.queues = new Map();
    }
    initializeRedis() {
        this.redisClient = new Redis(process.env.REDIS_AGENT_URL || "redis://localhost:6379", {
            tls: process.env.REDIS_AGENT_URL ? { rejectUnauthorized: false } : undefined,
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
            const memoryData = await this.redisClient.get(agent.redisMemoryKey);
            if (memoryData) {
                const parsedMemory = JSON.parse(memoryData);
                return parsedMemory.status;
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
        const memoryKey = `agent:${agentId}:memory`;
        const memoryData = await this.redisClient.get(memoryKey);
        if (memoryData) {
            const parsedMemory = JSON.parse(memoryData);
            parsedMemory.status.state = state;
            parsedMemory.status.lastUpdated = Date.now();
            if (progress !== undefined)
                parsedMemory.status.progress = progress;
            if (message)
                parsedMemory.status.messages.push(message);
            if (details)
                parsedMemory.status.details = {
                    ...parsedMemory.status.details,
                    ...details,
                };
            await this.redisClient.set(memoryKey, JSON.stringify(parsedMemory));
            return true;
        }
        return false;
    }
    async setupAgentMemory(agentId) {
        const memoryData = {
            startTime: Date.now(),
            agentId: agentId,
            status: {
                state: "running",
                progress: 0,
                messages: [],
                lastUpdated: Date.now(),
            },
        };
        const memoryKey = `agent:${agentId}:memory`;
        await this.redisClient.set(memoryKey, JSON.stringify(memoryData));
    }
    async deleteAgentMemory(agentId) {
        const memoryKey = `agent:${agentId}:memory`;
        await this.redisClient.del(memoryKey);
    }
}
//# sourceMappingURL=agentQueueManager.js.map