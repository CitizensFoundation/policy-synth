import ioredis from "ioredis";
import { PsAgent } from "../dbModels/agent.js";
import { Job, Worker } from "bullmq";
import { PolicySynthOperationsAgent } from "./operationsAgent.js";
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

export abstract class PolicySynthAgentQueue extends PolicySynthOperationsAgent {
  constructor() {
    super({} as any, undefined, 0, 100);
    this.startProgress = 0;
    this.endProgress = 100;
  }

  abstract get processors(): Array<{
    processor: new (
      agent: PsAgent,
      memory: any, //TODO: Fix this to T or something
      startProgress: number,
      endProgress: number
    ) => PolicySynthOperationsAgent;
    weight: number;
  }>;

  async processAllAgents() {
    let totalProgress = 0;

    for (let i = 0; i < this.processors.length; i++) {
      const { processor: Agent, weight } = this.processors[i];
      const startProgress = totalProgress;
      const endProgress = totalProgress + weight;

      const processorInstance = new Agent(
        this.agent,
        this.memory,
        startProgress,
        endProgress
      );
      await processorInstance.process();

      totalProgress = endProgress;
      await this.updateProgress(totalProgress, `${Agent.name} completed`);
    }
  }

  abstract get agentQueueName(): string;
  abstract setupMemoryIfNeeded(): Promise<void>;

  async setupAgentQueue() {
    if (this.agentQueueName) {
      const worker = new Worker(
        this.agentQueueName,
        async (job: Job) => {
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
            ]
          });
          if (loadedAgent) {
            this.agent = loadedAgent;
            await this.loadAgentMemoryFromRedis();
            await this.setupMemoryIfNeeded();

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
                this.logger.error(
                  `Unknown action ${data.action} for job ${job.id}`
                );
            }
          } else {
            this.logger.error(`Agent not found for job ${job.id}`);
            throw new Error(`Agent not found for job ${job.id}`);
          }
        },
        {
          connection: {
            host: redis.options.host,
            port: redis.options.port,
            maxRetriesPerRequest: null,
          },
          concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
          maxStalledCount: 0
        }
      );

      worker.on("completed", (job: Job) => {
        this.logger.info(
          `Job ${job.id} has been completed for agent ${this.agentQueueName}`
        );
        // Handle Outputs connectors
        this.updateProgress(100, "Agent completed");
      });

      worker.on("failed", (job: Job | undefined, err: Error) => {
        this.logger.error(
          `Job ${job?.id || "unknown"} has failed for agent ${
            this.agentQueueName
          }`,
          err
        );
        this.updateProgress(100, `Agent failed: ${err.message}`);
      });

      worker.on("error", (err: Error) => {
        this.logger.error(
          `An error occurred in the worker for agent ${this.agentQueueName}`,
          err
        );
        this.updateProgress(100, `Agent error: ${err.message}`);
      });

      worker.on("active", (job: Job) => {
        this.logger.info(
          `Job ${job.id} has started processing for agent ${this.agentQueueName}`
        );
        this.updateProgress(5, "Agent started");
      });

      worker.on("stalled", (jobId: string) => {
        this.logger.warn(
          `Job ${jobId} has been stalled for agent ${this.agentQueueName}`
        );
        this.updateProgress(100, "Agent stalled");
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
    await this.processAllAgents();
    // Handle Outputs connectors
  }

  private async stopAgent() {
    this.logger.info(`Stopping agent ${this.agent.id}`);
    // Implement logic to stop the agent
    // This might involve setting a flag in the agent's memory or database record
    await this.updateAgentStatus("stopped");
  }

  private async pauseAgent() {
    this.logger.info(`Pausing agent ${this.agent.id}`);
    // Implement logic to pause the agent
    // This might involve setting a flag in the agent's memory or database record
    await this.updateAgentStatus("paused");
  }

  private async updateAgentStatus(status: "running" | "stopped" | "paused") {
    if (this.agent) {
      //TODO: Implement this
      //   this.agent.status = status;
      await this.agent.save();
    }
  }
}
