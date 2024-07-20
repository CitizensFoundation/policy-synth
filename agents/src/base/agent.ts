import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PsAiModelManager } from "./agentModelManager.js";
import { PsProgressTracker } from "./agentProgressTracker.js";
import { PsConfigManager } from "./agentConfigManager.js";
import Redis from "ioredis";

export abstract class PolicySynthAgent extends PolicySynthAgentBase {
  memory!: PsAgentMemoryData;
  agent: PsAgent;
  modelManager: PsAiModelManager | undefined;
  progressTracker: PsProgressTracker;
  configManager: PsConfigManager;
  redis: Redis;

  skipAiModels = false;

  startProgress = 0;
  endProgress = 100;

  maxModelTokensOut = 4096;
  modelTemperature = 0.7;

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
        //agent ? agent.AiModels! : undefined,
        agent.AiModels || [],
        agent ? agent.Group?.private_access_configuration || [] : []/*this.getAccessConfigFromEnv()*/,
        this.maxModelTokensOut,
        this.modelTemperature,
        agent ? agent.id : -1,
        agent ? agent.user_id : -1
      );
    }

    this.progressTracker = new PsProgressTracker(
      agent.redisMemoryKey,
      startProgress,
      endProgress
    );

    this.configManager = new PsConfigManager(agent.configuration);

    this.redis = new Redis(
      process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
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

    await this.progressTracker.updateProgress(
      undefined,
      `Agent ${this.agent.Class?.name} Starting`
    );

    // The main processing logic would go here.
    // Subclasses would override this method to implement specific agent behaviors.
  }

  async loadAgentMemoryFromRedis() {
    try {
      const memoryData = await this.redis.get(this.agent.redisMemoryKey);
      if (memoryData) {
        this.memory = JSON.parse(memoryData);
      } else {
        console.error("No memory data found!");
      }
    } catch (error) {
      this.logger.error("Error initializing agent memory");
      this.logger.error(error);
    }
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
    await this.progressTracker.updateRangedProgress(progress, message);
  }

  async updateProgress(progress: number | undefined, message: string) {
    await this.progressTracker.updateProgress(progress, message);
  }

  getConfig<T>(uniqueId: string, defaultValue: T): T {
    return this.configManager.getConfig(uniqueId, defaultValue);
  }

  getConfigOld<T>(uniqueId: string, defaultValue: T): T {
    return this.configManager.getConfigOld(uniqueId, defaultValue);
  }

  async saveMemory() {
    try {
      await this.redis.set(
        this.agent.redisMemoryKey,
        JSON.stringify(this.memory)
      );
    } catch (error) {
      this.logger.error("Error saving agent memory to Redis");
      this.logger.error(error);
    }
  }

  async getTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    return this.modelManager?.getTokensFromMessages(messages) || 0;
  }

  formatNumber(number: number, fractions = 0) {
    return this.progressTracker.formatNumber(number, fractions);
  }

  // Additional methods that might be needed

  async setCompleted(message: string) {
    await this.progressTracker.setCompleted(message);
  }

  async setError(errorMessage: string) {
    await this.progressTracker.setError(errorMessage);
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
