import ioredis, { Redis, RedisOptions } from "ioredis";
import { Job, QueueEvents, Worker } from "bullmq";
import { PolicySynthAgent } from "./agent.js";
import { PsAgentConnector } from "../dbModels/agentConnector.js";
import { PsAgentConnectorClass } from "../dbModels/agentConnectorClass.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsExternalApiUsage } from "../dbModels/externalApiUsage.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAgent } from "../dbModels/agent.js";

export interface PsAgentStartJobData {
  agentId: number;
  action: "start" | "stop" | "pause";
  structuredAnswersOverrides?: Array<any>;
}

/**
 * Abstract queue that can hold multiple agent implementations
 */
export abstract class PolicySynthAgentQueue extends PolicySynthAgentBase {
  // Instead of single references, we keep them in maps keyed by agentId
  protected agentsMap: Map<number, PsAgent> = new Map();
  protected agentInstancesMap: Map<number, PolicySynthAgent> = new Map();
  protected agentStatusMap: Map<number, PsAgentStatus> = new Map();
  protected agentMemoryMap: Map<number, PsAgentMemoryData> = new Map();

  // Store Worker references here
  protected workers: Worker[] = [];

  structuredAnswersOverrides?: Array<any>;
  skipCheckForProgress = true;
  redisClient!: ioredis;

  constructor() {
    super();
    this.initializeRedis();
  }

  abstract get processors(): Array<{
    processor: new (
      agent: PsAgent,
      memory: any,
      startProgress: number,
      endProgress: number
    ) => PolicySynthAgent;
    weight: number;
  }>;

  abstract get agentQueueName(): string;
  abstract setupMemoryIfNeeded(agentId: number): Promise<void>;

  initializeRedis() {
    let redisUrl =
      process.env.REDIS_AGENT_URL ||
      process.env.REDIS_URL ||
      "redis://localhost:6379";
    // Handle 'redis://h:' case if needed
    if (redisUrl.startsWith("redis://h:")) {
      redisUrl = redisUrl.replace("redis://h:", "redis://:");
    }

    console.log("AgentQueueManager: Initializing Redis connection:", redisUrl);
    const options: RedisOptions = {
      maxRetriesPerRequest: null,
      tls: redisUrl.startsWith("rediss://")
        ? { rejectUnauthorized: false }
        : undefined,
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
  async getOrCreatePsAgent(agentId: number): Promise<PsAgent> {
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
      })) as PsAgent | undefined;

      if (!psAgent) {
        throw new Error(`Agent not found in DB for agentId=${agentId}`);
      }
      this.agentsMap.set(agentId, psAgent);
    }
    return psAgent;
  }

  /**
   * Retrieve or create the actual PolicySynthAgent instance.
   */
  getOrCreateAgentInstance(agentId: number): PolicySynthAgent {
    let policySynthAgent = this.agentInstancesMap.get(agentId);
    if (!policySynthAgent) {
      const psAgent = this.agentsMap.get(agentId);
      if (!psAgent) {
        throw new Error(
          `PsAgent object not found in agentsMap for agentId=${agentId}`
        );
      }

      // We'll take the first processor’s weight as an example
      const startProgress = 0;
      const endProgress = 100;

      let agentMemory = this.agentMemoryMap.get(agentId);
      if (!agentMemory) {
        agentMemory = { agentId };
        this.agentMemoryMap.set(agentId, agentMemory);
      }

      // By default, pick your first processor
      const firstProcessorClass = this.processors[0].processor;
      policySynthAgent = new firstProcessorClass(
        psAgent,
        agentMemory,
        startProgress,
        endProgress
      );

      this.agentInstancesMap.set(agentId, policySynthAgent);
    }
    return policySynthAgent;
  }

  /**
   * Loads agent memory from Redis if we haven't already
   */
  async loadAgentMemoryIfNeeded(agentId: number): Promise<PsAgentMemoryData> {
    const psAgent = this.agentsMap.get(agentId);
    if (!psAgent) {
      throw new Error(`No PsAgent found for agentId=${agentId}`);
    }

    let agentMemory = this.agentMemoryMap.get(agentId);
    if (!agentMemory) {
      const memoryString = await this.redisClient.get(psAgent.redisMemoryKey);
      if (memoryString) {
        agentMemory = JSON.parse(memoryString);
      }
      if (!agentMemory) {
        agentMemory = { agentId };
      }
      this.agentMemoryMap.set(agentId, agentMemory);
    }
    return agentMemory;
  }

  async processAllAgents(agentId: number) {
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

        const agentMemory = await this.loadAgentMemoryIfNeeded(agentId);
        const policySynthAgent = new AgentClass(
          psAgent,
          agentMemory,
          startProgress,
          endProgress
        );
        this.agentInstancesMap.set(agentId, policySynthAgent);

        await policySynthAgent.process();
      } catch (error) {
        throw error;
      }
    }
  }

  async loadAgentStatusFromRedis(
    agentId: number
  ): Promise<PsAgentStatus | undefined> {
    const psAgent = this.agentsMap.get(agentId);
    if (!psAgent) return undefined;
    try {
      const statusDataString = await this.redisClient.get(
        psAgent.redisStatusKey
      );
      if (statusDataString) {
        const status: PsAgentStatus = JSON.parse(statusDataString);
        this.agentStatusMap.set(agentId, status);
        return status;
      } else {
        console.error(
          `No status data found for agent ${agentId} ${psAgent.redisStatusKey}`
        );
      }
    } catch (error) {
      this.logger.error("Error initializing agent status", error);
    }
    return undefined;
  }

  async saveAgentStatusToRedis(agentId: number) {
    const psAgent = this.agentsMap.get(agentId);
    if (!psAgent) return;
    const status = this.agentStatusMap.get(agentId);
    if (!status) {
      this.logger.error(`Agent status not found for agentId=${agentId}`);
      return;
    }
    await this.redisClient.set(psAgent.redisStatusKey, JSON.stringify(status));
    this.logger.debug("Saved status to Redis for:" + psAgent.redisStatusKey);
    this.logger.debug(`Status: ${JSON.stringify(status, null, 2)}`);
  }

  async setupStatusIfNeeded(agentId: number) {
    this.logger.info(`Setting up agent status for agentId=${agentId}`);
    await this.loadAgentStatusFromRedis(agentId);
    const status = this.agentStatusMap.get(agentId);
    if (!status) {
      this.logger.error(`No status found for agent ${agentId}, resetting`);
      const newStatus: PsAgentStatus = {
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

      // Create a new worker
      const worker = new Worker(
        this.agentQueueName,
        async (job: Job) => {
          try {
            console.log(
              `Processing job ${job.id} for agentQueue ${this.agentQueueName}`
            );
            const data = job.data as PsAgentStartJobData;
            const { agentId, action, structuredAnswersOverrides } = data;

            // 1) Ensure PsAgent is loaded
            const loadedAgent = await this.getOrCreatePsAgent(agentId);

            // 2) Load memory
            const agentMemory = await this.loadAgentMemoryIfNeeded(agentId);
            if (structuredAnswersOverrides) {
              this.structuredAnswersOverrides = structuredAnswersOverrides;
              agentMemory.structuredAnswersOverrides =
                structuredAnswersOverrides;
            }

            // 3) Subclass-specific memory setup
            await this.setupMemoryIfNeeded(agentId);
            console.log(
              `${action} agent ${loadedAgent.id} with structured answers overrides:`,
              JSON.stringify(structuredAnswersOverrides)
            );

            // 4) Setup status
            await this.setupStatusIfNeeded(agentId);

            // 5) Dispatch action
            switch (action) {
              case "start":
                this.logger.info(`Starting agent ${agentId}`);
                await this.updateAgentStatus(agentId, "running");
                await this.processAllAgents(agentId);
                break;
              case "stop":
                this.logger.info(`Stopping agent ${agentId}`);
                await this.updateAgentStatus(agentId, "stopped");
                throw new Error("StoppedByUser");
              case "pause":
                this.logger.info(`Pausing agent ${agentId}`);
                await this.updateAgentStatus(agentId, "paused");
                break;
              default:
                throw new Error(`Unknown action ${action} for job ${job.id}`);
            }
          } catch (error) {
            console.error(
              `Error processing job ${job.id} for agentQueue ${this.agentQueueName}`,
              error
            );
            throw error;
          }
        },
        {
          connection: this.redisClient,
          concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "20"),
          maxStalledCount: 0,
        }
      );

      // Keep a reference to this worker
      this.workers.push(worker);

      // Optional event handlers
      worker.on("completed", (job: Job) => {
        this.logger.info(
          `Job ${job.id} has completed for queue ${this.agentQueueName}`
        );
      });
      worker.on("failed", (job: Job | undefined, err: Error) => {
        this.logger.error(
          `Job ${job?.id || "unknown"} failed for ${this.agentQueueName}`,
          err
        );
      });
      worker.on("error", (err: Error) => {
        this.logger.error(
          `An error occurred in the worker for ${this.agentQueueName}`,
          err
        );
      });
      worker.on("active", (job: Job) => {
        this.logger.info(
          `Job ${job.id} started processing for ${this.agentQueueName}`
        );
      });
      worker.on("stalled", (jobId: string) => {
        this.logger.warn(
          `Job ${jobId} has been stalled for ${this.agentQueueName}`
        );
      });

      // Optional: queueEvents for global monitoring
      const queueEvents = new QueueEvents(this.agentQueueName, {
        connection: {
          host: (this.redisClient.options as any).host,
          port: (this.redisClient.options as any).port,
        },
      });
      queueEvents.on("waiting", ({ jobId }) => {
        this.logger.debug(
          `Job ${jobId} is waiting in queue ${this.agentQueueName}`
        );
      });
      queueEvents.on("progress", ({ jobId, data }) => {
        this.logger.debug(`Job ${jobId} reported progress: ${data}`);
      });
      queueEvents.on("drained", () => {
        this.logger.debug(`Queue ${this.agentQueueName} was drained`);
      });
      queueEvents.on("removed", ({ jobId }) => {
        this.logger.debug(
          `Job ${jobId} was removed from queue ${this.agentQueueName}`
        );
      });

      this.logger.info(
        `Worker set up successfully for agentQueue ${this.agentQueueName}`
      );
    } else {
      this.logger.error("Top level agent queue name not set");
    }
  }

  // Methods that change the status
  async updateAgentStatus(
    agentId: number,
    state: "running" | "stopped" | "paused" | "error",
    message?: string
  ) {
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

  /**
   * Pause all workers in this queue so they don't pick up new jobs,
   * and let any currently running jobs finish before resolving.
   */
  public async pauseAllWorkersGracefully() {
    this.logger.info(`Pausing all workers for queue "${this.agentQueueName}"`);
    for (const worker of this.workers) {
      // This call ensures:
      // 1) No new jobs are picked up.
      // 2) We wait for any in-flight jobs to complete before the promise resolves.
      await worker.pause(true);
    }
    this.logger.info(
      `All workers in queue "${this.agentQueueName}" are paused and have finished in-flight jobs.`
    );
  }
}
