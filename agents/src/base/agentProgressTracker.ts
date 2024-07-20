import Redis from "ioredis";
import { PolicySynthAgentBase } from "./agentBase.js";

export class PsProgressTracker extends PolicySynthAgentBase {
  private redis: Redis;
  private redisMemoryKey: string;
  private memory: PsAgentMemoryData;
  private startProgress: number;
  private endProgress: number;

  constructor(
    redisMemoryKey: string,
    startProgress: number,
    endProgress: number,
    redisUrl: string = process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
  ) {
    super();
    this.redis = new Redis(redisUrl);
    this.redisMemoryKey = redisMemoryKey;
    this.startProgress = startProgress;
    this.endProgress = endProgress;
    this.memory = {
      agentId: 0, // This will be set when memory is loaded
      status: {
        state: "running",
        progress: startProgress,
        messages: [],
        lastUpdated: Date.now(),
      },
    };
  }

  public async loadMemoryFromRedis(): Promise<void> {
    try {
      const memoryData = await this.redis.get(this.redisMemoryKey);
      if (memoryData) {
        this.memory = JSON.parse(memoryData);
      } else {
        this.logger.error("No memory data found!");
      }
    } catch (error) {
      this.logger.error("Error initializing agent memory");
      this.logger.error(error);
    }
  }

  public async updateRangedProgress(progress: number | undefined, message: string): Promise<void> {
    if (!this.memory.status) {
      this.memory.status = {
        state: "running",
        progress: this.startProgress,
        messages: [],
        lastUpdated: Date.now(),
      };
    }

    // Calculate the progress within the range
    if (progress !== undefined) {
      const rangeSize = this.endProgress - this.startProgress;
      const scaledProgress = this.startProgress + (progress / 100) * rangeSize;
      this.memory.status.progress = Math.min(
        Math.max(scaledProgress, this.startProgress),
        this.endProgress
      );
    }

    this.memory.status.messages.push(message);
    this.memory.status.lastUpdated = Date.now();

    // Save updated memory to Redis
    await this.saveMemory();
  }

  public async updateProgress(progress: number | undefined, message: string): Promise<void> {
    if (!this.memory.status) {
      this.memory.status = {
        state: "running",
        progress: 0,
        messages: [],
        lastUpdated: Date.now(),
      };
    }

    if (progress !== undefined) {
      this.memory.status.progress = progress;
    }

    this.memory.status.messages.push(message);
    this.memory.status.lastUpdated = Date.now();

    // Save updated memory to Redis
    await this.saveMemory();
  }

  private async saveMemory(): Promise<void> {
    try {
      await this.redis.set(this.redisMemoryKey, JSON.stringify(this.memory));
    } catch (error) {
      this.logger.error("Error saving agent memory to Redis");
      this.logger.error(error);
    }
  }

  public getProgress(): number {
    return this.memory.status?.progress || 0;
  }

  public getMessages(): string[] {
    return this.memory.status?.messages || [];
  }

  public getState(): string {
    return this.memory.status?.state || "unknown";
  }

  public setAgentId(agentId: number): void {
    this.memory.agentId = agentId;
  }

  public async setCompleted(message: string): Promise<void> {
    if (!this.memory.status) {
      this.memory.status = {
        state: "completed",
        progress: 100,
        messages: [],
        lastUpdated: Date.now(),
      };
    } else {
      this.memory.status.state = "completed";
      this.memory.status.progress = 100;
    }

    this.memory.status.messages.push(message);
    this.memory.status.lastUpdated = Date.now();

    await this.saveMemory();
  }

  public async setError(errorMessage: string): Promise<void> {
    if (!this.memory.status) {
      this.memory.status = {
        state: "error",
        progress: 0,
        messages: [],
        lastUpdated: Date.now(),
      };
    } else {
      this.memory.status.state = "error";
    }

    this.memory.status.messages.push(errorMessage);
    this.memory.status.lastUpdated = Date.now();

    await this.saveMemory();
  }

  public formatNumber(number: number, fractions = 0): string {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: fractions,
    }).format(number);
  }
}