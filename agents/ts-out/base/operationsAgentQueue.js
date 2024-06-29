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
            new Worker(this.agentQueueName, async (job) => {
                const data = job.data;
                const loadedAgent = await PsAgent.findByPk(data.agentId);
                if (loadedAgent) {
                    this.agent = loadedAgent;
                    await this.loadAgentMemoryFromRedis();
                }
                else {
                    this.logger.error(`Agent not found for job ${job.id}`);
                }
                await this.processAllAgents();
                // Handle Outputs connectors
            }, {
                connection: redis,
                concurrency: parseInt(process.env.PS_AGENTS_CONCURRENCY || "10"),
            });
        }
        else {
            this.logger.error("Top level agent queue name not set");
        }
    }
}
//# sourceMappingURL=operationsAgentQueue.js.map