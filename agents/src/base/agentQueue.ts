import ioredis, { Redis, RedisOptions } from "ioredis";
import { PsAgent } from "../dbModels/agent.js";
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

export abstract class PolicySynthAgentQueue extends PolicySynthAgent {
  status!: PsAgentStatus;
  redisClient!: Redis;

  skipCheckForProgress = true;

  constructor() {
    super({} as any, undefined, 0, 100);
    this.startProgress = 0;
    this.endProgress = 100;
    this.initializeRedis();
  }

  initializeRedis() {
    let redisUrl = process.env.REDIS_AGENT_URL || process.env.REDIS_URL || "redis://localhost:6379";

    // Handle the 'redis://h:' case
    if (redisUrl.startsWith("redis://h:")) {
      redisUrl = redisUrl.replace("redis://h:", "redis://:");
    }

    console.log(
      "AgentQueueManager: Initializing Redis connection: " + redisUrl
    );

    const options: RedisOptions = {
      maxRetriesPerRequest: null,
      tls: redisUrl.startsWith("rediss://")
        ? { rejectUnauthorized: false }
        : undefined,
    };

    this.redisClient = new Redis(redisUrl, options);

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

  async loadAgentStatusFromRedis(): Promise<PsAgentStatus> {
    try {
      const statusDataString = await this.redis.get(this.agent.redisStatusKey);
      if (statusDataString) {
        this.status = JSON.parse(statusDataString);
      } else {
        console.error(
          `No status data found for agent ${this.agent.id} ${this.agent.redisStatusKey}`
        );
      }
    } catch (error) {
      this.logger.error("Error initializing agent status");
      this.logger.error(error);
    }

    return this.status;
  }

  async saveAgentStatusToRedis() {
    if (this.status) {
      await this.redis.set(
        this.agent.redisStatusKey,
        JSON.stringify(this.status)
      );
      this.logger.debug(
        "Saved status to Redis for:" + this.agent.redisStatusKey
      );
      this.logger.debug(`Status: ${JSON.stringify(this.status, null, 2)}`);
    } else {
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

  abstract get processors(): Array<{
    processor: new (
      agent: PsAgent,
      memory: any, //TODO: Fix this to T or something
      startProgress: number,
      endProgress: number
    ) => PolicySynthAgent;
    weight: number;
  }>;

  async processAllAgents() {
    let totalProgress = 0;

    for (let i = 0; i < this.processors.length; i++) {
      const { processor: Agent, weight } = this.processors[i];
      const startProgress = totalProgress;
      const endProgress = totalProgress + weight;

      try {
        const processorInstance = new Agent(
          this.agent,
          this.memory,
          startProgress,
          endProgress
        );
        await processorInstance.process();

        //totalProgress = endProgress;
        //await this.updateProgress(totalProgress, `${Agent.name} completed`);
      } catch (error) {
        throw error;
      }
    }
  }

  abstract get agentQueueName(): string;
  abstract setupMemoryIfNeeded(): Promise<void>;

  async setupAgentQueue() {
    if (this.agentQueueName) {
      console.log(`Setting up worker for agentQueue ${this.agentQueueName}`);
      const worker = new Worker(
        this.agentQueueName,
        async (job: Job) => {
          try {
            console.log(
              `Processing job ${job.id} for agentQueue ${this.agentQueueName}`
            );
            const data = job.data as PsAgentStartJobData;
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
                {
                  model: User,
                  as: "User",
                  attributes: ["id", "email", "name"],
                },
                {
                  model: Group,
                  as: "Group",
                  //TODO: Don't have private_access_configuration as a part of the group, find a more secure solution so Group.find will never expose the keys accidentally
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
            });

            if (loadedAgent) {
              this.logger.debug(`Agent group config: ${loadedAgent.group_id}`);
              this.logger.debug(
                `Agent group config: ${loadedAgent.Group?.configuration}`
              );
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
                  throw new Error(
                    `Unknown action ${data.action} for job ${job.id}`
                  );
              }
            } else {
              throw new Error(`Agent not found for job ${job.id}`);
            }
          } catch (error) {
            throw error;
          }
        },
        {
          connection: this.redisClient,
          concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
          maxStalledCount: 0,
        }
      );

      worker.on("completed", (job: Job) => {
        this.logger.info(
          `Job ${job.id} has been completed for agent ${this.agentQueueName}`
        );
      });

      worker.on("failed", (job: Job | undefined, err: Error) => {
        this.logger.error(
          `Job ${job?.id || "unknown"} has failed for agent ${
            this.agentQueueName
          }`,
          err
        );
      });

      worker.on("error", (err: Error) => {
        this.logger.error(
          `An error occurred in the worker for agent ${this.agentQueueName}`,
          err
        );
        this.updateAgentStatus("error", err.message);
      });

      worker.on("active", (job: Job) => {
        this.logger.info(
          `Job ${job.id} has started processing for agent ${this.agentQueueName}`
        );
      });

      worker.on("stalled", (jobId: string) => {
        this.logger.warn(
          `Job ${jobId} has been stalled for agent ${this.agentQueueName}`
        );
      });

      // QueueEvents for global monitoring
      const queueEvents = new QueueEvents(this.agentQueueName, {
        connection: {
          host: this.redisClient.options.host,
          port: this.redisClient.options.port,
        },
      });

      queueEvents.on("waiting", ({ jobId }) => {
        this.logger.debug(
          `Job ${jobId} is waiting in queue ${this.agentQueueName}`
        );
      });

      queueEvents.on("progress", ({ jobId, data }) => {
        this.logger.debug(
          `Job ${jobId} reported progress in queue ${this.agentQueueName}:`,
          data
        );
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
        `Worker set up successfully for agent ${this.agentQueueName}`
      );
    } else {
      this.logger.error("Top level agent queue name not set");
    }
  }

  async startAgent() {
    this.logger.info(`Starting agent ${this.agent.id}`);
    try {
      await this.updateAgentStatus("running");
      await this.processAllAgents();
    } catch (error) {
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

  async updateAgentStatus(
    state: "running" | "stopped" | "paused" | "error",
    message?: string
  ) {
    this.logger.debug(`Changing agent status to ${state} with message ${message}`);
    //TODO: Look into moving status into the agent db object so we can update with transactions
    await this.loadStatusFromRedis();
    if (this.agent && this.status) {
      this.status.state = state;
      this.status.messages.push(
        message || `Agent ${this.agent.id} is now ${state}`
      );
      this.logger.info(`Agent ${this.agent.id} is now ${state}`);
      await this.saveAgentStatusToRedis();
    } else {
      this.logger.error("Agent or agent memory not initialized");
    }
  }
}
