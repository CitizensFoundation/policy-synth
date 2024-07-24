import ioredis from "ioredis";
import { PsAgent } from "../dbModels/agent.js";
import { Job, Worker } from "bullmq";
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
const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

export abstract class PolicySynthAgentQueue extends PolicySynthAgent {
  status!: PsAgentStatus;

  skipCheckForProgress = true;

  constructor() {
    super({} as any, undefined, 0, 100);
    this.startProgress = 0;
    this.endProgress = 100;
  }

  async loadAgentStatusFromRedis(): Promise<PsAgentStatus> {
    try {
      const statusDataString = await this.redis.get(this.agent.redisStatusKey);
      if (statusDataString) {
        this.status = JSON.parse(statusDataString);
      } else {
        throw Error("No memory data found!");
      }
    } catch (error) {
      this.logger.error("Error initializing agent memory");
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
    } else {
      this.logger.error("Agent status not initialized");
    }
  }

  async setupStatusIfNeeded() {
    await this.loadAgentStatusFromRedis();
    if (!this.status) {
      this.status = {
        state: "running",
        progress: 0,
        messages: [],
        lastUpdated: Date.now(),
      };
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

        totalProgress = endProgress;
        await this.updateProgress(totalProgress, `${Agent.name} completed`);
      } catch (error) {
        throw error;
      }
    }
  }

  abstract get agentQueueName(): string;
  abstract setupMemoryIfNeeded(): Promise<void>;

  async setupAgentQueue() {
    if (this.agentQueueName) {
      const worker = new Worker(
        this.agentQueueName,
        async (job: Job) => {
          try {
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
                { model: User, as: "User" },
                { model: Group, as: "Group" },
                { model: PsExternalApiUsage, as: "ExternalApiUsage" },
                { model: PsModelUsage, as: "ModelUsage" },
                { model: PsAiModel, as: "AiModels" },
              ],
            });

            if (loadedAgent) {
              this.agent = loadedAgent;
              await this.loadAgentMemoryFromRedis();
              await this.loadAgentStatusFromRedis();
              await this.setupMemoryIfNeeded();
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
          connection: {
            host: redis.options.host,
            port: redis.options.port,
            maxRetriesPerRequest: null,
          },
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

      this.logger.info(
        `Worker set up successfully for agent ${this.agentQueueName}`
      );
    } else {
      this.logger.error("Top level agent queue name not set");
    }
  }

  private async startAgent() {
    this.logger.info(`Starting agent ${this.agent.id}`);
    try {
      await this.processAllAgents();
    } catch (error) {
      throw error;
    }
  }

  private async stopAgent() {
    this.logger.info(`Stopping agent ${this.agent.id}`);
    await this.updateAgentStatus("stopped");
  }

  private async pauseAgent() {
    this.logger.info(`Pausing agent ${this.agent.id}`);
    await this.updateAgentStatus("paused");
  }

  private async updateAgentStatus(state: "running" | "stopped" | "paused") {
    //TODO: Look into moving status into the agent db object so we can update with transactions
    await this.loadStatusFromRedis();
    if (this.agent && this.status) {
      this.status.state = state;
      this.logger.info(`Agent ${this.agent.id} is now ${state}`);
      await this.saveAgentStatusToRedis();
    } else {
      this.logger.error("Agent or agent memory not initialized");
    }
  }
}
