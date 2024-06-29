import ioredis from "ioredis";
import { PsAgent } from "../dbModels/agent.js";
import { Worker } from "bullmq";
import { PolicySynthOperationsAgent } from "./operationsAgent.js";
//TODO: Look to pool redis connections
const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
export class PolicySynthAgentQueue extends PolicySynthOperationsAgent {
    constructor() {
        super({}, undefined, 0, 100);
        this.startProgress = 0;
        this.endProgress = 100;
    }
    async processAllAgents() {
        let totalProgress = 0;
        for (let i = 0; i < this.processors.length; i++) {
            const { processor: Agent, weight } = this.processors[i];
            const startProgress = totalProgress;
            const endProgress = totalProgress + weight;
            const processorInstance = new Agent(this.agent, this.memory, startProgress, endProgress);
            await processorInstance.process();
            totalProgress = endProgress;
            await this.updateProgress(totalProgress, `${Agent.name} completed`);
        }
    }
    async setupAgentQueue() {
        if (this.agentQueueName) {
            const worker = new Worker(this.agentQueueName, async (job) => {
                const data = job.data;
                const loadedAgent = await PsAgent.findByPk(data.agentId);
                if (loadedAgent) {
                    this.agent = loadedAgent;
                    await this.loadAgentMemoryFromRedis();
                }
                else {
                    this.logger.error(`Agent not found for job ${job.id}`);
                    throw new Error(`Agent not found for job ${job.id}`);
                }
                await this.processAllAgents();
                // Handle Outputs connectors
            }, {
                connection: redis,
                concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
            });
            worker.on('completed', (job) => {
                this.logger.info(`Job ${job.id} has been completed for agent ${this.agentQueueName}`);
            });
            worker.on('failed', (job, err) => {
                this.logger.error(`Job ${job?.id || 'unknown'} has failed for agent ${this.agentQueueName}`, err);
            });
            worker.on('error', (err) => {
                this.logger.error(`An error occurred in the worker for agent ${this.agentQueueName}`, err);
            });
            worker.on('active', (job) => {
                this.logger.info(`Job ${job.id} has started processing for agent ${this.agentQueueName}`);
            });
            worker.on('stalled', (jobId) => {
                this.logger.warn(`Job ${jobId} has been stalled for agent ${this.agentQueueName}`);
            });
            this.logger.info(`Worker set up successfully for agent ${this.agentQueueName}`);
        }
        else {
            this.logger.error("Top level agent queue name not set");
        }
    }
}
//# sourceMappingURL=operationsAgentQueue.js.map