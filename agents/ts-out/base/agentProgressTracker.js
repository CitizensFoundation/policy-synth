import Redis from "ioredis";
import { PolicySynthAgentBase } from "./agentBase.js";
export class PsProgressTracker extends PolicySynthAgentBase {
    redis;
    redisStatusKey;
    status;
    startProgress;
    endProgress;
    constructor(redisStatusKey, startProgress, endProgress, redisUrl = process.env.REDIS_MEMORY_URL || "redis://localhost:6379") {
        super();
        this.redis = new Redis(redisUrl);
        this.redisStatusKey = redisStatusKey;
        this.startProgress = startProgress;
        this.endProgress = endProgress;
        this.logger.debug(`Progress range: ${startProgress} - ${endProgress} Redis key: ${redisStatusKey}`);
    }
    async loadStatusFromRedis() {
        try {
            const statusDataString = await this.redis.get(this.redisStatusKey);
            if (statusDataString) {
                this.status = JSON.parse(statusDataString);
                this.logger.debug(`Loaded status from Redis: ${statusDataString} from key: ${this.redisStatusKey}`);
            }
            else {
                this.logger.error("No status data found!");
            }
        }
        catch (error) {
            this.logger.error("Error initializing agent status");
            this.logger.error(error);
        }
    }
    async updateRangedProgress(progress, message) {
        await this.loadStatusFromRedis();
        if (!this.status) {
            this.logger.error("Agent status not initialized");
            return;
        }
        // Calculate the progress within the range
        if (progress !== undefined) {
            const rangeSize = this.endProgress - this.startProgress;
            const scaledProgress = this.startProgress + (progress / 100) * rangeSize;
            this.status.progress = Math.min(Math.max(scaledProgress, this.startProgress), this.endProgress);
        }
        this.status.messages.push(message);
        this.status.lastUpdated = Date.now();
        // Save updated memory to Redis
        await this.saveRedisStatus();
    }
    async updateProgress(progress, message) {
        await this.loadStatusFromRedis();
        if (!this.status) {
            this.logger.error("Agent status not initialized");
            return;
        }
        if (progress !== undefined) {
            this.status.progress = progress;
        }
        this.status.messages.push(message);
        this.status.lastUpdated = Date.now();
        // Save updated memory to Redis
        await this.saveRedisStatus();
    }
    async saveRedisStatus() {
        try {
            await this.redis.set(this.redisStatusKey, JSON.stringify(this.status));
        }
        catch (error) {
            this.logger.error("Error saving agent memory to Redis");
            this.logger.error(error);
        }
    }
    getProgress() {
        return this.status?.progress || 0;
    }
    getMessages() {
        return this.status?.messages || [];
    }
    getState() {
        return this.status?.state || "unknown";
    }
    async setCompleted(message) {
        await this.loadStatusFromRedis();
        this.status.state = "completed";
        this.status.progress = 100;
        this.status.messages.push(message);
        this.status.lastUpdated = Date.now();
        await this.saveRedisStatus();
    }
    async setError(errorMessage) {
        if (!this.status) {
            this.status = {
                state: "error",
                progress: 0,
                messages: [],
                lastUpdated: Date.now(),
            };
        }
        else {
            this.status.state = "error";
        }
        this.status.messages.push(errorMessage);
        this.status.lastUpdated = Date.now();
        await this.saveRedisStatus();
    }
    formatNumber(number, fractions = 0) {
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: fractions,
        }).format(number);
    }
}
//# sourceMappingURL=agentProgressTracker.js.map