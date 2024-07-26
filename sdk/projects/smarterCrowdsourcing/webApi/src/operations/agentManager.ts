import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import {
  PsAgent,
  PsAgentConnector,
  PsAgentClass,
  PsModelUsage,
  PsExternalApiUsage,
  PsAiModel
} from '../models/index.js';

export class AgentManagerService {
  private redisClient!: Redis;
  private queues: Map<string, Queue>;

  constructor() {
    this.initializeRedis();
    this.queues = new Map();
  }

  private initializeRedis() {
    this.redisClient = new Redis(process.env.REDIS_AGENT_URL || 'redis://localhost:6379', {
      tls: process.env.REDIS_AGENT_URL ? { rejectUnauthorized: false } : undefined
    });

    this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
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

  async createAgent(agentData: any): Promise<PsAgent> {
    const agent = await PsAgent.create(agentData);
    await this.setupAgentMemory(agent.id);
    return agent;
  }

  async getAgent(agentId: number): Promise<PsAgent | null> {
    return PsAgent.findByPk(agentId, {
      include: [
        { model: PsAgentClass, as: 'Class' },
        { model: PsAgentConnector, as: 'Connectors' },
        { model: PsModelUsage, as: 'ModelUsage' },
        { model: PsExternalApiUsage, as: 'ExternalApiUsage' },
        { model: PsAiModel, as: 'AiModels' },
      ],
    });
  }

  async updateAgent(agentId: number, updateData: any): Promise<PsAgent | null> {
    const agent = await PsAgent.findByPk(agentId);
    if (!agent) return null;

    await agent.update(updateData);
    return agent;
  }

  async deleteAgent(agentId: number): Promise<boolean> {
    const agent = await PsAgent.findByPk(agentId);
    if (!agent) return false;

    await this.deleteAgentMemory(agentId);
    await agent.destroy();
    return true;
  }

  async startAgentProcessing(agentId: number): Promise<boolean> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: 'Class' }],
    });
    if (!agent || !agent.Class) return false;

    const queueName = agent.Class.configuration.queueName;
    const queue = this.getQueue(queueName);
    await queue.add('control-message', {
      type: 'start-processing',
      agentId: agent.id,
    });
    await this.updateAgentStatus(agent.id, 'processing');
    return true;
  }

  async pauseAgentProcessing(agentId: number): Promise<boolean> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: 'Class' }],
    });
    if (!agent || !agent.Class) return false;

    const queueName = agent.Class.configuration.queueName;
    const queue = this.getQueue(queueName);
    await queue.add('control-message', {
      type: 'pause-processing',
      agentId: agent.id,
    });
    await this.updateAgentStatus(agent.id, 'paused');
    return true;
  }

  async createTask(agentId: number, taskData: any): Promise<string> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: 'Class' }],
    });
    if (!agent || !agent.Class) throw new Error('Agent or Agent Class not found');

    const queueName = agent.Class.configuration.queueName;
    const queue = this.getQueue(queueName);
    const job = await queue.add('agent-task', {
      agentId,
      ...taskData,
    });
    return job.id!;
  }

  async getAgentStatus(agentId: number): Promise<PsAgentStatus | null> {
    const memoryKey = `agent:${agentId}:memory`;
    const memoryData = await this.redisClient.get(memoryKey);
    if (memoryData) {
      const parsedMemory: PsAgentMemoryData = JSON.parse(memoryData);
      return parsedMemory.status;
    }
    return null;
  }

  async updateAgentStatus(
    agentId: number,
    state: PsAgentStatus['state'],
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
      if (details) parsedMemory.status.details = { ...parsedMemory.status.details, ...details };
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
        state: 'processing',
        progress: 0,
        messages: [],
        lastUpdated: Date.now()
      }
    };

    const memoryKey = `agent:${agentId}:memory`;
    await this.redisClient.set(memoryKey, JSON.stringify(memoryData));
  }

  private async deleteAgentMemory(agentId: number): Promise<void> {
    const memoryKey = `agent:${agentId}:memory`;
    await this.redisClient.del(memoryKey);
  }
}