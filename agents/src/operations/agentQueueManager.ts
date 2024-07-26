import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { PsAgent, PsAgentClass } from "../dbModels/index.js";

export class AgentQueueManager {
  private redisClient!: Redis;
  private queues: Map<string, Queue>;

  constructor() {
    console.log("AgentQueueManager: Initializing");
    this.initializeRedis();
    this.queues = new Map();
  }

  private initializeRedis() {
    const redisUrl = process.env.REDIS_AGENT_URL || "redis://localhost:6379";
    console.log("AgentQueueManager: Initializing Redis connection: "+redisUrl);
    this.redisClient = new Redis(
      redisUrl,
      {
        tls: process.env.REDIS_AGENT_URL ? { rejectUnauthorized: false } : undefined,
      }
    );

    this.redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    this.redisClient.on("connect", () => {
      console.log("AgentQueueManager: Successfully connected to Redis");
    });
  }

  private getQueue(queueName: string): Queue {
    console.log(`AgentQueueManager: Getting queue for ${queueName}`);
    if (!this.queues.has(queueName)) {
      console.log(`AgentQueueManager: Creating new queue for ${queueName}`);
      const newQueue = new Queue(queueName, {
        connection: this.redisClient,
      });
      this.queues.set(queueName, newQueue);
    }
    return this.queues.get(queueName)!;
  }

  async controlAgent(agentId: number, action: string): Promise<string> {
    console.log(`AgentQueueManager: Controlling agent ${agentId} with action ${action}`);
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });

    if (!agent || !agent.Class) {
      console.error(`AgentQueueManager: Agent or Agent Class not found for agent ${agentId}`);
      throw new Error("Agent or Agent Class not found");
    }

    const queueName = agent.Class.configuration.queueName;
    if (!queueName) {
      console.error(`AgentQueueManager: Queue name not defined for agent class ${agent.Class.id}`);
      throw new Error("Queue name not defined for this agent class");
    }

    const queue = this.getQueue(queueName);

    console.log(`AgentQueueManager: Adding ${action} job to queue ${queueName} for agent ${agentId}`);
    await queue.add(`${action}Agent`, { agentId, action });

    const message = `${action.charAt(0).toUpperCase() + action.slice(1)} request for agent ${agentId} queued in ${queueName}`;
    console.log(`AgentQueueManager: ${message}`);
    return message;
  }

  async startAgentProcessing(agentId: number): Promise<boolean> {
    console.log(`AgentQueueManager: Starting agent processing for agent ${agentId}`);
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });

    if (!agent || !agent.Class) {
      console.error(`AgentQueueManager: Agent or Agent Class not found for agent ${agentId}`);
      return false;
    }

    const queueName = agent.Class.configuration.queueName;
    const queue = this.getQueue(queueName);
    console.log(`AgentQueueManager: Adding start-processing job to queue ${queueName} for agent ${agentId}`);
    await queue.add("control-message", {
      type: "start-processing",
      agentId: agent.id,
    });
    console.log(`AgentQueueManager: Updating agent ${agentId} status to running`);
    await this.updateAgentStatus(agent.id, "running");
    return true;
  }

  async pauseAgentProcessing(agentId: number): Promise<boolean> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });
    if (!agent || !agent.Class) return false;

    const queueName = agent.Class.configuration.queueName;
    const queue = this.getQueue(queueName);
    await queue.add("control-message", {
      type: "pause-processing",
      agentId: agent.id,
    });
    await this.updateAgentStatus(agent.id, "paused");
    return true;
  }

  async getAgentStatus(agentId: number): Promise<PsAgentStatus | null> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });

    if (agent) {
      const statusDataString = await this.redisClient.get(agent.redisStatusKey);
      if (statusDataString) {
        const statusData: PsAgentStatus = JSON.parse(statusDataString);
        return statusData;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async updateAgentStatus(
    agentId: number,
    state: PsAgentStatus["state"],
    progress?: number,
    message?: string,
    details?: Record<string, any>
  ): Promise<boolean> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });

    if (agent) {
      const statusDataString = await this.redisClient.get(agent.redisStatusKey);
      if (statusDataString) {
        const statusData: PsAgentStatus = JSON.parse(statusDataString);
        statusData.state = state;
        statusData.lastUpdated = Date.now();
        if (progress !== undefined) statusData.progress = progress;
        if (message) statusData.messages.push(message);
        if (details)
          statusData.details = {
            ...statusData.details,
            ...details,
          };
        await this.redisClient.set(
          agent.redisStatusKey,
          JSON.stringify(statusData)
        );
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
