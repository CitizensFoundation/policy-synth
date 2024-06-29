import ioredis from "ioredis";
import { PsAgent } from "../dbModels/agent.js";
import { Job, Worker } from "bullmq";
import { PolicySynthOperationsAgent } from "./operationsAgent.js";

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

  abstract get processors(): {
    processor: new (
      agent: PsAgent,
      memory: PsAgentMemoryData,
      startProgress: number,
      endProgress: number
    ) => PolicySynthOperationsAgent;
    weight: number;
  }[];

  async processAllAgents() {
    let totalProgress = 0;

    for (let i = 0; i < this.processors.length; i++) {
      const { processor: Processor, weight } = this.processors[i];
      const startProgress = totalProgress;
      const endProgress = totalProgress + weight;

      const processorInstance = new Processor(
        this.agent,
        this.memory,
        startProgress,
        endProgress
      );
      await processorInstance.process();

      totalProgress = endProgress;
      await this.updateProgress(totalProgress, `${Processor.name} completed`);
    }
  }

  abstract get agentQueueName(): string;

  async setupAgentQueue() {
    if (this.agentQueueName) {
      new Worker(
        this.agentQueueName,
        async (job: Job) => {
          const data = job.data as PsAgentStartJobData;
          const loadedAgent = await PsAgent.findByPk(data.agentId);
          if (loadedAgent) {
            this.agent = loadedAgent;
            await this.loadAgentMemoryFromRedis();
          } else {
            this.logger.error(`Agent not found for job ${job.id}`);
          }
          await this.processAllAgents();
          // Handle Outputs connectors
        },
        {
          connection: redis,
          concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
        }
      );
    } else {
      this.logger.error("Top level agent queue name not set");
    }
  }
}
