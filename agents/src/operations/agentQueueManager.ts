import { Queue, QueueEvents } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import { PsAgent, PsAgentClass } from "../dbModels/index.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";

export class AgentQueueManager extends PolicySynthAgentBase {
  redisClient!: Redis;
  queues: Map<string, Queue>;

  constructor() {
    super();
    this.logger.info("AgentQueueManager: Initializing");
    this.initializeRedis();
    this.queues = new Map();
  }

  initializeRedis() {
    let redisUrl = process.env.REDIS_AGENT_URL || process.env.REDIS_URL || "redis://localhost:6379";

    // Handle the 'redis://h:' case
    if (redisUrl.startsWith("redis://h:")) {
      redisUrl = redisUrl.replace("redis://h:", "redis://:");
    }

    this.logger.info(
      "AgentQueueManager: Initializing Redis connection: " + redisUrl
    );

    const options: RedisOptions = {
      tls: redisUrl.startsWith("rediss://")
        ? { rejectUnauthorized: false }
        : undefined,
      maxRetriesPerRequest: null
    };

    this.redisClient = new Redis(redisUrl, options);

    this.redisClient.on("error", (err) => {
      this.logger.error("Redis Client Error", err);
    });

    this.redisClient.on("connect", () => {
      this.logger.info("AgentQueueManager: Successfully connected to Redis");
    });

    this.redisClient.on("reconnecting", () => {
      this.logger.info("AgentQueueManager: Redis client is reconnecting");
    });

    this.redisClient.on("ready", () => {
      this.logger.info("AgentQueueManager: Redis client is ready");
    });
  }

  getQueue(queueName: string): Queue {
    this.logger.info(`AgentQueueManager: Getting queue for ${queueName}`);
    if (!this.queues.has(queueName)) {
      this.logger.info(`AgentQueueManager: Creating new queue for ${queueName}`);
      const newQueue = new Queue(queueName, {
        connection: this.redisClient,
      });

      newQueue.on("error", (error) => {
        this.logger.info(`Error in queue ${queueName}:`, error);
      });

      newQueue.on("waiting", (jobId) => {
        this.logger.info(`Job ${jobId} is waiting in queue ${queueName}`);
      });

      // Create QueueEvents instance for global events
      const queueEvents = new QueueEvents(queueName, {
        connection: this.redisClient,
      });

      // Add event listeners for debugging
      queueEvents.on('waiting', ({ jobId }) => {
        this.logger.info(`Job ${jobId} is waiting in queue ${queueName}`);
      });

      queueEvents.on('active', ({ jobId, prev }) => {
        this.logger.info(`Job ${jobId} is active in queue ${queueName} (prev state: ${prev})`);
      });

      queueEvents.on('completed', ({ jobId, returnvalue }) => {
        this.logger.info(`Job ${jobId} completed in queue ${queueName}. Result:`, returnvalue);
      });

      queueEvents.on('failed', ({ jobId, failedReason }) => {
        this.logger.info(`Job ${jobId} failed in queue ${queueName}. Reason:`, failedReason);
      });

      queueEvents.on('progress', ({ jobId, data }) => {
        this.logger.info(`Job ${jobId} reported progress in queue ${queueName}:`, data);
      });

      queueEvents.on('removed', ({ jobId }) => {
        this.logger.info(`Job ${jobId} was removed from queue ${queueName}`);
      });

      queueEvents.on('drained', () => {
        this.logger.info(`Queue ${queueName} was drained`);
      });

      queueEvents.on('error', (error) => {
        this.logger.info(`Error in queue ${queueName}:`, error);
      });

      this.queues.set(queueName, newQueue);
    }
    return this.queues.get(queueName)!;
  }

  async controlAgent(agentId: number, action: string): Promise<string> {
    this.logger.info(
      `AgentQueueManager: Controlling agent ${agentId} with action ${action}`
    );
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });

    if (!agent || !agent.Class) {
      this.logger.error(
        `AgentQueueManager: Agent or Agent Class not found for agent ${agentId}`
      );
      throw new Error("Agent or Agent Class not found");
    }

    const queueName = agent.Class.configuration.queueName;
    if (!queueName) {
      this.logger.error(
        `AgentQueueManager: Queue name not defined for agent class ${agent.Class.id}`
      );
      throw new Error("Queue name not defined for this agent class");
    }

    const queue = this.getQueue(queueName);

    this.logger.info(
      `AgentQueueManager: Adding ${action} job to queue ${queueName} for agent ${agentId}`
    );
    await queue.add(`${action}Agent`, { agentId, action });

    const message = `${
      action.charAt(0).toUpperCase() + action.slice(1)
    } request for agent ${agentId} queued in ${queueName}`;
    this.logger.info(`AgentQueueManager: ${message}`);
    return message;
  }

  async startAgentProcessing(agentId: number): Promise<boolean> {
    this.logger.info(
      `AgentQueueManager: Starting agent processing for agent ${agentId}`
    );
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });

    if (!agent || !agent.Class) {
      this.logger.error(
        `AgentQueueManager: Agent or Agent Class not found for agent ${agentId}`
      );
      return false;
    }

    const queueName = agent.Class.configuration.queueName;
    const queue = this.getQueue(queueName);
    this.logger.info(
      `AgentQueueManager: Adding start-processing job to queue ${queueName} for agent ${agentId}`
    );
    await queue.add("control-message", {
      type: "start-processing",
      agentId: agent.id,
    });
    this.logger.info(
      `AgentQueueManager: Updating agent ${agentId} status to running`
    );
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

  async clearAgentStatusMessages(agentId: number): Promise<void> {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAgentClass, as: "Class" }],
    });

    if (agent) {
      const statusDataString = await this.redisClient.get(agent.redisStatusKey);
      if (statusDataString) {
        const statusData: PsAgentStatus = JSON.parse(statusDataString);
        statusData.messages = [];
        statusData.lastUpdated = Date.now();
        await this.redisClient.set(
          agent.redisStatusKey,
          JSON.stringify(statusData)
        );
      }
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
