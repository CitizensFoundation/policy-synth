import { Queue } from "bullmq";
import { Redis } from "ioredis";
import {
  PsAgent,
  PsAgentClass,
} from "../models/index.js";

export class AgentQueueManager {
  private redisClient!: Redis;
  private queues: Map<string, Queue>;

  constructor() {
    this.initializeRedis();
    this.queues = new Map();
  }

  private initializeRedis() {
    this.redisClient = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        tls: process.env.REDIS_URL ? { rejectUnauthorized: false } : undefined,
      }
    );

    this.redisClient.on("error", (err) =>
      console.error("Redis Client Error", err)
    );
  }

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const newQueue = new Queue(queueName, {
        connection: this.redisClient,
      });
      this.queues.set(queueName, newQueue);
    }
    return this.queues.get(queueName)!;
  }

  async controlAgent(agentId: number, action: string): Promise<string> {
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

    return `${
      action.charAt(0).toUpperCase() + action.slice(1)
    } request for agent ${agentId} queued in ${queueName}`;
  }

  async startAgentProcessing(agentId: number): Promise<boolean> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });
    if (!agent || !agent.Class) return false;

    const queueName = agent.Class.configuration.queueName;
    const queue = this.getQueue(queueName);
    await queue.add("control-message", {
      type: "start-processing",
      agentId: agent.id,
    });
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
      const memoryData = await this.redisClient.get(agent.redisMemoryKey);
      if (memoryData) {
        const parsedMemory: PsAgentMemoryData = JSON.parse(memoryData);
        return parsedMemory.status;
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
    const memoryKey = `agent:${agentId}:memory`;
    const memoryData = await this.redisClient.get(memoryKey);
    if (memoryData) {
      const parsedMemory: PsAgentMemoryData = JSON.parse(memoryData);
      parsedMemory.status.state = state;
      parsedMemory.status.lastUpdated = Date.now();
      if (progress !== undefined) parsedMemory.status.progress = progress;
      if (message) parsedMemory.status.messages.push(message);
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

  private async setupAgentMemory(agentId: number): Promise<void> {
    const memoryData: PsAgentMemoryData = {
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

  private async deleteAgentMemory(agentId: number): Promise<void> {
    const memoryKey = `agent:${agentId}:memory`;
    await this.redisClient.del(memoryKey);
  }
}
