import Redis from "ioredis";
import { PolicySynthAgentBase } from "./agentBase.js";

export class PsProgressTracker extends PolicySynthAgentBase {
  redis: Redis;
  redisStatusKey: string;
  status!: PsAgentStatus;
  startProgress: number;
  endProgress: number;

  constructor(
    redisStatusKey: string,
    startProgress: number,
    endProgress: number,
    redisUrl: string = process.env.REDIS_AGENT_URL || process.env.REDIS_URL || "redis://localhost:6379"
  ) {
    super();
    this.redis = new Redis(redisUrl);
    this.redisStatusKey = redisStatusKey;
    this.startProgress = startProgress;
    this.endProgress = endProgress;
    this.logger.debug(
      `Progress range: ${startProgress} - ${endProgress} Redis key: ${redisStatusKey}`
    );
  }

  public async loadStatusFromRedis(): Promise<void> {
    if (this.redisStatusKey) {
      try {
        const statusDataString = await this.redis.get(this.redisStatusKey);
        if (statusDataString) {
          this.status = JSON.parse(statusDataString);
          /*this.logger.debug(
            `Loaded status from Redis: ${statusDataString} from key: ${this.redisStatusKey}`
          );*/
        } else {
          this.logger.error("No status data found!");
        }
      } catch (error) {
        this.logger.error("Error initializing agent status");
        this.logger.error(error);
      }
    } else {
      this.logger.error("No Redis key set for agent status");
    }
  }

  public async updateRangedProgress(
    progress: number | undefined,
    message: string
  ): Promise<void> {
    await this.loadStatusFromRedis();

    if (!this.status) {
      this.logger.error("Agent status not initialized");
      return;
    }

    //this.logger.debug(`Updating progress: ${progress} message: ${message}`);

    // Calculate the progress within the range
    if (progress !== undefined) {
      const rangeSize = this.endProgress - this.startProgress;
      const scaledProgress = this.startProgress + (progress / 100) * rangeSize;
      this.status.progress = Math.min(
        Math.max(scaledProgress, this.startProgress),
        this.endProgress
      );
    }

    if (!this.status.messages) {
      this.logger.debug(
        `No messages for ${this.redisStatusKey} ${JSON.stringify(this.status)}`
      );
    } else {
      this.status.messages.push(message);
    }

    this.status.lastUpdated = Date.now();

    // Save updated memory to Redis
    await this.saveRedisStatus();
  }

  public async updateProgress(
    progress: number | undefined,
    message: string
  ): Promise<void> {
    await this.loadStatusFromRedis();

    if (!this.status) {
      this.logger.error("Agent status not initialized");
      return;
    }

    //this.logger.debug(`Updating progress: ${progress} message: ${message}`);

    if (progress !== undefined) {
      this.status.progress = progress;
    }

    this.status.messages.push(message);
    this.status.lastUpdated = Date.now();

    // Save updated status to Redis
    await this.saveRedisStatus();
  }

  async saveRedisStatus(): Promise<void> {
    if (this.redisStatusKey) {
      try {
        //this.logger.debug(`Saving agent memory to Redis: ${JSON.stringify(this.status)}`);
        await this.redis.set(this.redisStatusKey, JSON.stringify(this.status));
      } catch (error) {
        this.logger.error("Error saving agent memory to Redis");
        this.logger.error(error);
      }
    } else {
      this.logger.error("No Redis key set for agent status");
      return;
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
    await this.loadStatusFromRedis();
    this.status.state = "completed";
    this.status.progress = 100;

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
