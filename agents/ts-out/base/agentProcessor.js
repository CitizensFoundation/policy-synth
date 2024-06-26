import ioredis from "ioredis";
import { PolicySynthSimpleAgentBase } from "./simpleAgent.js";
//TODO: Look to pool redis connections
const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
export class BaseAgentProcessor extends PolicySynthSimpleAgentBase {
    memory;
    job;
    constructor() {
        super();
    }
    async setup(job) {
        this.job = job;
        try {
            const memoryData = await redis.get(this.agent.redisMemoryKey);
            if (memoryData) {
                this.memory = JSON.parse(memoryData);
            }
            else {
                await this.initializeMemory(job);
                this.logger.debug(`Initialized memory for job ${job.id}`);
            }
        }
        catch (error) {
            this.logger.error("Error initializing memory");
            this.logger.error(error);
        }
    }
    async saveMemory() {
        if (this.memory) {
            this.memory.lastSavedAt = Date.now();
            await redis.set(this.agent.redisMemoryKey, JSON.stringify(this.memory));
        }
        else {
            this.logger.error("No memory to save");
        }
    }
    async updateProgress(progress) {
        if (!this.memory.status) {
            this.memory.status = {
                state: 'processing',
                progress: 0,
                messages: [],
                lastUpdated: Date.now(),
            };
        }
        this.memory.status.progress = progress;
        this.memory.status.lastUpdated = Date.now();
        await this.saveMemory();
    }
    async addStatusMessage(message) {
        if (!this.memory.status) {
            this.memory.status = {
                state: 'processing',
                progress: 0,
                messages: [],
                lastUpdated: Date.now(),
            };
        }
        this.memory.status.messages.push(message);
        this.memory.status.lastUpdated = Date.now();
        await this.saveMemory();
    }
}
//# sourceMappingURL=agentProcessor.js.map