import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PsAiModelManager } from "./agentModelManager.js";
import { PsProgressTracker } from "./agentProgressTracker.js";
import { PsConfigManager } from "./agentConfigManager.js";
import Redis from "ioredis";
import util from "util";

export class AgentExecutionStoppedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentExecutionStoppedError";
  }
}

export abstract class PolicySynthAgent extends PolicySynthAgentBase {
  memory!: PsAgentMemoryData;
  agent: PsAgent;
  modelManager: PsAiModelManager | undefined;
  progressTracker: PsProgressTracker | undefined;
  configManager: PsConfigManager;
  redis: Redis;

  skipAiModels = false;
  skipCheckForProgress = false;

  startProgress = 0;
  endProgress = 100;

  maxModelTokensOut = 4096;
  modelTemperature = 0.7;

  pauseCheckInterval = 1000 * 60 * 60 * 48; // 48 hours
  pauseTimeout = 1000;

  private memorySaveTimer: NodeJS.Timeout | null = null;
  private memorySaveError: Error | null = null;

  constructor(
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    startProgress: number,
    endProgress: number
  ) {
    super();
    this.agent = agent;
    this.logger.debug(JSON.stringify(agent));

    if (
      !this.agent &&
      (!process.env.PS_AGENT_MAX_MODEL_TOKENS_OUT ||
        !process.env.PS_AGENT_MODEL_TEMPERATURE ||
        !process.env.PS_REDIS_MEMORY_KEY ||
        !process.env.PS_AI_MODEL_PROVIDER ||
        !process.env.PS_AI_MODEL_NAME ||
        !process.env.PS_AI_MODEL_TYPE ||
        !process.env.PS_AI_MODEL_SIZE)
    ) {
      throw new Error(
        "Agent not found and required environment variables not set"
      );
    }

    if (!this.skipAiModels) {
      this.modelManager = new PsAiModelManager(
        agent.AiModels || [],
        agent
          ? agent.Group?.private_access_configuration || []
          : [] /*this.getAccessConfigFromEnv()*/,
        this.maxModelTokensOut,
        this.modelTemperature,
        agent ? agent.id : -1,
        agent ? agent.user_id : -1
      );
    }

    if (agent && !agent.redisStatusKey) {
      this.logger.error("Agent status key not set", agent);
    }

    this.progressTracker = new PsProgressTracker(
      agent ? agent.redisStatusKey : "agent:status:-1", //TODO: Look into this fallback
      startProgress,
      endProgress
    );

    this.configManager = new PsConfigManager(agent.configuration);

    this.redis = new Redis(
      process.env.REDIS_AGENT_URL || process.env.REDIS_URL || "redis://localhost:6379"
    );

    if (memory) {
      this.memory = memory;
    } else {
      this.loadAgentMemoryFromRedis();
    }
  }

  async process() {
    if (!this.memory) {
      this.logger.error("Memory is not initialized");
      throw new Error("Memory is not initialized");
    }

    await this.progressTracker?.updateProgress(
      undefined,
      `Agent ${this.agent.Class?.name} Starting`
    );

    // The main processing logic would go here.
    // Subclasses would override this method to implement specific agent behaviors.
  }

  async loadAgentMemoryFromRedis(): Promise<PsAgentMemoryData> {
    try {
      this.logger.debug(`Loading memory from Redis: ${this.agent.redisMemoryKey}`);
      const memoryData = await this.redis.get(this.agent.redisMemoryKey);
      if (memoryData) {
        this.memory = JSON.parse(memoryData);
      } else {
        throw Error("No memory data found!");
      }
    } catch (error) {
      this.logger.error("Error initializing agent memory");
      this.logger.error(error);
    }

    return this.memory;
  }

  async callModel(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    parseJson = true,
    limitedRetries = false,
    tokenOutEstimate = 120,
    streamingCallbacks?: Function
  ) {
    return this.modelManager?.callModel(
      modelType,
      modelSize,
      messages,
      parseJson,
      limitedRetries,
      tokenOutEstimate,
      streamingCallbacks
    );
  }

  async updateRangedProgress(progress: number | undefined, message: string) {
    if (this.progressTracker) {
      await this.progressTracker.updateRangedProgress(progress, message);
    } else {
      this.logger.error("Progress tracker not initialized");
    }
  }

  async updateProgress(progress: number | undefined, message: string) {
    await this.progressTracker?.updateProgress(progress, message);
  }

  getConfig<T>(uniqueId: string, defaultValue: T): T {
    return this.configManager.getConfig(uniqueId, defaultValue);
  }

  getConfigOld<T>(uniqueId: string, defaultValue: T): T {
    return this.configManager.getConfigOld(uniqueId, defaultValue);
  }

  public async loadStatusFromRedis(): Promise<PsAgentStatus | undefined> {
    try {
      const statusDataString = await this.redis.get(this.agent.redisStatusKey);
      if (statusDataString) {
        /*this.logger.debug(
          `Loading status from Redis: ${statusDataString} from key: ${this.agent.redisStatusKey}`
        );*/
        return JSON.parse(statusDataString);
      } else {
        this.logger.error("No memory data found!");
      }
    } catch (error) {
      this.logger.error("Error initializing agent memory");
      this.logger.error(error);
    }
  }

  async checkProgressForPauseOrStop(): Promise<void> {
    let status = await this.loadStatusFromRedis();
    if (!status) {
      console.warn("Agent status not initialized");
    } else {
      //this.logger.debug(JSON.stringify(status, null, 2));
      if (status.state === "stopped") {
        throw new AgentExecutionStoppedError("Agent execution stopped");
      }

      if (status.state === "paused") {
        const startPauseTime = Date.now();
        while (status && status.state === "paused") {
          await new Promise((resolve) =>
            setTimeout(resolve, this.pauseCheckInterval)
          );
          status = await this.loadStatusFromRedis();

          if (Date.now() - startPauseTime > this.pauseTimeout) {
            throw new AgentExecutionStoppedError(
              "Agent execution timed out while paused"
            );
          }

          if (status) {
            if (status.state === "stopped") {
              throw new AgentExecutionStoppedError(
                "Agent execution stopped while paused"
              );
            }

            if (status.state === "running") {
              break;
            }
          }
        }
      }
    }
  }

  scheduleMemorySave(): void {
    if (!this.memorySaveTimer) {
      this.memorySaveTimer = setTimeout(async () => {
        try {
          await this.saveMemory();
          this.memorySaveError = null;
        } catch (error) {
          this.memorySaveError =
            error instanceof Error ? error : new Error(String(error));
        } finally {
          if (this.memorySaveTimer) {
            clearTimeout(this.memorySaveTimer);
            this.memorySaveTimer = null;
          }
        }
      }, 15000);
    }
  }

  checkLastMemorySaveError(): void {
    if (this.memorySaveError) {
      const error = this.memorySaveError;
      this.memorySaveError = null; // Clear the error after throwing
      throw error;
    }
  }

  async saveMemory() {
    try {
      await this.redis.set(
        this.agent.redisMemoryKey,
        JSON.stringify(this.memory)
      );

      //this.logger.debug(`Saving memory to Redis: ${util.inspect(this.memory)}`);

      if (!this.skipCheckForProgress) {
        await this.checkProgressForPauseOrStop();
      }
    } catch (error) {
      if (error instanceof AgentExecutionStoppedError) {
        throw error;
      } else {
        this.logger.error("Error saving agent memory to Redis");
        this.logger.error(error);
      }
    }
  }

  async getTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    return this.modelManager?.getTokensFromMessages(messages) || 0;
  }

  // Additional methods that might be needed

  async setCompleted(message: string) {
    await this.progressTracker?.setCompleted(message);
  }

  async setError(errorMessage: string) {
    await this.progressTracker?.setError(errorMessage);
  }

  getModelUsageEstimates(): PsAgentModelUsageEstimate[] | undefined {
    return this.configManager.getModelUsageEstimates();
  }

  getApiUsageEstimates(): PsAgentApiUsageEstimate[] | undefined {
    return this.configManager.getApiUsageEstimates();
  }

  getMaxTokensOut(): number | undefined {
    return this.configManager.getMaxTokensOut();
  }

  getTemperature(): number | undefined {
    return this.configManager.getTemperature();
  }
}
