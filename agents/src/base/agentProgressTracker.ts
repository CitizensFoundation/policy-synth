import Redis from "ioredis";
import { PolicySynthAgentBase } from "./agentBase.js";

export class PsProgressTracker extends PolicySynthAgentBase {
  private redis: Redis;
  private redisStatusKey: string;
  private status!: PsAgentStatus;
  private startProgress: number;
  private endProgress: number;

  constructor(
    redisStatusKey: string,
    startProgress: number,
    endProgress: number,
    redisUrl: string = process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
  ) {
    super();
    this.redis = new Redis(redisUrl);
    this.redisStatusKey = redisStatusKey;
    this.startProgress = startProgress;
    this.endProgress = endProgress;
  }

  public async loadStatusFromRedis(): Promise<void> {
    try {
      const statusDataString = await this.redis.get(this.redisStatusKey);
      if (statusDataString) {
        this.status = JSON.parse(statusDataString);
      } else {
        this.logger.error("No memory data found!");
      }
    } catch (error) {
      this.logger.error("Error initializing agent memory");
      this.logger.error(error);
    }
  }

  public async updateRangedProgress(progress: number | undefined, message: string): Promise<void> {
    if (!this.status) {
      this.status = {
        state: "running",
        progress: this.startProgress,
        messages: [],
        lastUpdated: Date.now(),
      };
    } else {
      this.loadStatusFromRedis();
    }

    // Calculate the progress within the range
    if (progress !== undefined) {
      const rangeSize = this.endProgress - this.startProgress;
      const scaledProgress = this.startProgress + (progress / 100) * rangeSize;
      this.status.progress = Math.min(
        Math.max(scaledProgress, this.startProgress),
        this.endProgress
      );
    }

    this.status.messages.push(message);
    this.status.lastUpdated = Date.now();

    // Save updated memory to Redis
    await this.saveRedisStatus();
  }

  public async updateProgress(progress: number | undefined, message: string): Promise<void> {
    if (!this.status) {
      this.status = {
        state: "running",
        progress: this.startProgress,
        messages: [],
        lastUpdated: Date.now(),
      };
    } else {
      this.loadStatusFromRedis();
    }

    if (progress !== undefined) {
      this.status.progress = progress;
    }

    this.status.messages.push(message);
    this.status.lastUpdated = Date.now();

    // Save updated memory to Redis
    await this.saveRedisStatus();
  }

  private async saveRedisStatus(): Promise<void> {
    try {
      await this.redis.set(this.redisStatusKey, JSON.stringify(this.status));
    } catch (error) {
      this.logger.error("Error saving agent memory to Redis");
      this.logger.error(error);
    }
  }

  public getProgress(): number {
    return this.status?.progress || 0;
  }

  public getMessages(): string[] {
    return this.status?.messages || [];
  }

  public getState(): string {
    return this.status?.state || "unknown";
  }

  public async setCompleted(message: string): Promise<void> {
    if (!this.status) {
      this.status = {
        state: "completed",
        progress: 100,
        messages: [],
        lastUpdated: Date.now(),
      };
    } else {
      this.status.state = "completed";
      this.status.progress = 100;
    }

    this.status.messages.push(message);
    this.status.lastUpdated = Date.now();

    await this.saveRedisStatus();
  }

  public async setError(errorMessage: string): Promise<void> {
    if (!this.status) {
      this.status = {
        state: "error",
        progress: 0,
        messages: [],
        lastUpdated: Date.now(),
      };
    } else {
      this.status.state = "error";
    }

    this.status.messages.push(errorMessage);
    this.status.lastUpdated = Date.now();

    await this.saveRedisStatus();
  }

  public formatNumber(number: number, fractions = 0): string {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: fractions,
    }).format(number);
  }
}