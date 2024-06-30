import ioredis from "ioredis";

import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { ClaudeChat } from "../aiModels/claudeChat.js";
import { OpenAiChat } from "../aiModels/openAiChat.js";
import { GoogleGeminiChat } from "../aiModels/googleGeminiChat.js";
import { AzureOpenAiChat } from "../aiModels/azureOpenAiChat.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAgent } from "../dbModels/agent.js";

import { Op, Transaction } from "sequelize";
import { PolicySynthBaseAgent } from "./agent.js";
import { Job, Worker } from "bullmq";
import { PsAiModelType } from "../aiModelTypes.js";
import { sequelize } from "../dbModels/sequelize.js";
import { TiktokenModel, encoding_for_model } from "tiktoken";

//TODO: Look to pool redis connections
const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

export abstract class PolicySynthOperationsAgent extends PolicySynthBaseAgent {
  memory!: PsAgentMemoryData;
  agent: PsAgent;
  models: Map<PsAiModelType, BaseChatModel> = new Map();

  skipAiModels = false;

  //TODO: Find a better way, I think
  modelIds: Map<PsAiModelType, number> = new Map();

  limitedLLMmaxRetryCount = 3;
  mainLLMmaxRetryCount = 10;

  maxModelTokensOut = 4096;
  modelTemperature = 0.7;

  startProgress: number;
  endProgress: number;

  rateLimits: PsModelRateLimitTracking = {};

  constructor(
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    startProgress: number,
    endProgress: number
  ) {
    super();
    this.agent = agent;
    this.logger.debug(JSON.stringify(agent));
    if (!this.skipAiModels) {
      this.initializeModels();
    }
    if (memory) {
      this.memory = memory;
    } else {
      this.loadAgentMemoryFromRedis();
    }

    this.startProgress = startProgress;
    this.endProgress = endProgress;
  }

  async process() {
    if (!this.memory) {
      this.logger.error("Memory is not initialized");
      throw new Error("Memory is not initialized");
    }

    await this.updateProgress(
      undefined,
      `Agent ${this.agent.Class?.name} Starting`
    );
  }

  async loadAgentMemoryFromRedis() {
    try {
      const memoryData = await redis.get(this.agent.redisMemoryKey);
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

  async initializeModels() {
    const aiModels = this.agent.AiModels;
    if (!aiModels || aiModels.length === 0) {
      this.logger.info(`No AI models found for agent ${this.agent.id}`);
      return;
    }

    if (!this.agent.Group || !this.agent.Group.private_access_configuration) {
      throw new Error("Agent group or group configuration not found");
    }

    const accessConfiguration = this.agent.Group.private_access_configuration;

    for (const model of aiModels) {
      const modelType = model.configuration.type as PsAiModelType;
      const apiKeyConfig = accessConfiguration.find(
        (access) => access.aiModelId === model.id
      );

      if (!apiKeyConfig) {
        this.logger.warn(
          `API key configuration not found for model ${model.id}`
        );
        continue;
      }

      const baseConfig = {
        apiKey: apiKeyConfig.apiKey,
        modelName: model.configuration.model,
        maxTokensOut: this.maxModelTokensOut,
        temperature: this.modelTemperature,
      } as PsAiModelConfig;

      switch (model.configuration.provider) {
        case "anthropic":
          this.models.set(modelType, new ClaudeChat(baseConfig));
          break;
        case "openai":
          this.models.set(modelType, new OpenAiChat(baseConfig));
          break;
        case "google":
          this.models.set(modelType, new GoogleGeminiChat(baseConfig));
          break;
        case "azure":
          this.models.set(
            modelType,
            new AzureOpenAiChat({
              ...baseConfig,
              endpoint: model.configuration.endpoint!,
              deploymentName: model.configuration.deploymentName!,
            })
          );
          break;
        default:
          this.logger.warn(
            `Unsupported model provider: ${model.configuration.provider}`
          );
      }
      this.modelIds.set(modelType, model.id);
    }

    if (this.models.size === 0) {
      throw new Error("No supported AI models found for this agent");
    }
  }

  async callModel(
    modelType: PsAiModelType,
    messages: PsModelMessage[],
    parseJson = true,
    limitedRetries = false,
    tokenOutEstimate = 120,
    streamingCallbacks?: Function
  ) {
    switch (modelType) {
      case PsAiModelType.Text:
        return await this.callTextModel(
          messages,
          parseJson,
          limitedRetries,
          tokenOutEstimate,
          streamingCallbacks
        );
      case PsAiModelType.Embedding:
        return await this.callEmbeddingModel(messages);
      case PsAiModelType.MultiModal:
        return await this.callMultiModalModel(messages);
      case PsAiModelType.Audio:
        return await this.callAudioModel(messages);
      case PsAiModelType.Video:
        return await this.callVideoModel(messages);
      case PsAiModelType.Image:
        return await this.callImageModel(messages);
      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }
  }

  async callTextModel(
    messages: PsModelMessage[],
    parseJson = true,
    limitedRetries = false,
    tokenOutEstimate = 120,
    streamingCallbacks?: Function
  ) {
    const model = this.models.get(PsAiModelType.Text);
    if (!model) {
      throw new Error(`No model available for type ${PsAiModelType.Text}`);
    }

    try {
      let retryCount = 0;
      const maxRetries = limitedRetries
        ? this.limitedLLMmaxRetryCount
        : this.mainLLMmaxRetryCount;
      let retry = true;

      while (retry && retryCount < maxRetries) {
        try {
          const tokensIn = await model.getNumTokensFromMessages(messages);
          const estimatedTokensToAdd = tokensIn + tokenOutEstimate;

          //TODO: Get Rate limit working again
          //await this.checkRateLimits(PsAiModelType.Text, estimatedTokensToAdd);
          //await this.updateRateLimits(PsAiModelType.Text, tokensIn);

          const response = await model.generate(
            messages,
            !!streamingCallbacks,
            streamingCallbacks
          );

          if (response) {
            const tokensOut = await model.getNumTokensFromMessages([
              { role: "assistant", message: response },
            ]);

            //await this.updateRateLimits(PsAiModelType.Text, tokensOut);
            await this.saveTokenUsage(PsAiModelType.Text, tokensIn, tokensOut);

            if (parseJson) {
              let parsedJson;
              try {
                parsedJson = this.parseJsonResponse(response.trim());
              } catch (error) {
                retryCount++;
                this.logger.warn(`Retrying callTextModel ${retryCount}`);
                continue;
              }

              if (
                parsedJson == '"[]"' ||
                parsedJson == "[]" ||
                parsedJson == "'[]'"
              ) {
                this.logger.warn(
                  `JSON processing returned an empty array string ${parsedJson}`
                );
                parsedJson = [];
              }

              return parsedJson;
            } else {
              return response.trim();
            }
          } else {
            retryCount++;
            this.logger.warn(`callTextModel response was empty, retrying`);
          }
        } catch (error: any) {
          this.logger.warn("Error from model, retrying");
          if (error.message && error.message.indexOf("429") > -1) {
            this.logger.warn("429 error, retrying");
          }
          if (
            error.message &&
            (error.message.indexOf(
              "Failed to generate output due to special tokens in the input"
            ) > -1 ||
              error.message.indexOf(
                "The model produced invalid content. Consider modifying"
              ) > -1)
          ) {
            this.logger.error(
              "Failed to generate output due to special tokens in the input stopping or The model produced invalid content."
            );
            retryCount = maxRetries;
          } else {
            this.logger.warn(error);
            this.logger.warn(error.stack);
          }
          if (retryCount >= maxRetries) {
            throw error;
          } else {
            retryCount++;
          }
        }
        const sleepTime = 4500 + retryCount * 5000;
        this.logger.debug(
          `Sleeping for ${sleepTime} ms before retrying. Retry count: ${retryCount}}`
        );
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
      }
    } catch (error) {
      this.logger.error("Unrecoverable Error in callTextModel method");
      this.logger.error(error);
      throw error;
    }
  }

  async callEmbeddingModel(messages: PsModelMessage[]) {
    // Placeholder for embedding model call
    this.logger.warn("Embedding model call not yet implemented");
    return null;
  }

  async callMultiModalModel(messages: PsModelMessage[]) {
    // Placeholder for multi-modal model call
    this.logger.warn("Multi-modal model call not yet implemented");
    return null;
  }

  async callAudioModel(messages: PsModelMessage[]) {
    // Placeholder for audio model call
    this.logger.warn("Audio model call not yet implemented");
    return null;
  }

  async callVideoModel(messages: PsModelMessage[]) {
    // Placeholder for video model call
    this.logger.warn("Video model call not yet implemented");
    return null;
  }

  async callImageModel(messages: PsModelMessage[]) {
    // Placeholder for image model call
    this.logger.warn("Image model call not yet implemented");
    return null;
  }

  async saveTokenUsage(
    modelType: PsAiModelType,
    tokensIn: number,
    tokensOut: number
  ) {
    this.logger.debug(
      `Saving token usage for model ${modelType} and agent ${this.agent.id} tokensIn: ${tokensIn} tokensOut: ${tokensOut}`
    );
    const model = this.models.get(modelType);
    const modelId = this.modelIds.get(modelType);

    if (!model || !modelId) {
      throw new Error(`Model of type ${modelType} not initialized`);
    }

    this.logger.debug(`Model: ${model.modelName}`);

    try {
      // Use a transaction to ensure data consistency
      await sequelize.transaction(async (t: Transaction) => {
        const [usage, created] = await PsModelUsage.findOrCreate({
          where: {
            model_id: modelId,
            agent_id: this.agent.id,
          },
          defaults: {
            token_in_count: tokensIn,
            token_out_count: tokensOut,
            token_in_cached_context_count: 0,
            model_id: modelId,
            agent_id: this.agent.id,
            user_id: this.agent.user_id,
          },
          transaction: t,
        });

        if (!created) {
          // Use increment to safely update the counters only if the record wasn't just created
          await usage.increment(
            {
              token_in_count: tokensIn,
              token_out_count: tokensOut,
            },
            { transaction: t }
          );
        }

        this.logger.debug("Usage after update: ", usage.get({ plain: true }));
      });

      this.logger.info(
        `Token usage updated for agent ${this.agent.id} and model ${model.modelName}`
      );
    } catch (error) {
      this.logger.error("Error saving or updating token usage in database");
      this.logger.error(error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  formatNumber(number: number, fractions = 0) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: fractions,
    }).format(number);
  }

  async updateRangedProgress(progress: number | undefined, message: string) {
    if (!this.memory.status) {
      this.memory.status = {
        state: "running",
        progress: this.startProgress,
        messages: [],
        lastUpdated: Date.now(),
      };
    }

    // Calculate the progress within the range
    if (progress) {
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

  async updateProgress(progress: number | undefined, message: string) {
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

  async saveMemory() {
    try {
      await redis.set(this.agent.redisMemoryKey, JSON.stringify(this.memory));
    } catch (error) {
      this.logger.error("Error saving agent memory to Redis");
      this.logger.error(error);
    }
  }

  //TODO: Look at putting the data into answers
  getConfigOld<T>(uniqueId: string, defaultValue: T): T {
    this.logger.debug(JSON.stringify(this.agent.configuration, null, 2));
    const answer = this.agent.configuration.answers?.find(
      (a) => a.uniqueId === uniqueId
    );
    if (answer) {
      if (typeof defaultValue === "number") {
        return Number(answer.value) as T;
      } else if (typeof defaultValue === "boolean") {
        return (answer.value === "true") as T;
      } else if (Array.isArray(defaultValue)) {
        return JSON.parse(answer.value as string) as T[] as T;
      }
      return answer.value as T;
    } else {
      this.logger.error(`Configuration answer not found for ${uniqueId}`);
    }
    return defaultValue;
  }

  async getTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    let encoding;
    if (this.models.get(PsAiModelType.Text)) {
      encoding = encoding_for_model(
        this.models.get(PsAiModelType.Text)!.modelName as TiktokenModel
      );
    } else {
      encoding = encoding_for_model("gpt-4o");
    }
    let totalTokens = 0;

    for (const message of messages) {
      // Every message follows <im_start>{role/name}\n{content}<im_end>\n
      totalTokens += 4;

      for (const [key, value] of Object.entries(message)) {
        totalTokens += encoding.encode(value).length;
        if (key === "name") {
          totalTokens -= 1; // Role is always required and always 1 token
        }
      }
    }

    totalTokens += 2; // Every reply is primed with <im_start>assistant

    encoding.free(); // Free up the memory used by the encoder

    return totalTokens;
  }

  getConfig<T>(uniqueId: string, defaultValue: T): T {
    if (uniqueId in this.agent.configuration) {
      //@ts-ignore
      const value: unknown = this.agent.configuration[uniqueId];
      this.logger.debug(`Value for ${uniqueId}: ${value}`);

      // Check for null, undefined, or empty string and return defaultValue
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        this.logger.debug(`Returning default value for ${uniqueId}`);
        return defaultValue;
      }

      this.logger.debug(`Type of value for ${uniqueId}: ${typeof value}`);

      // If value is not a string, return it as is (assuming it's already of type T)
      if (typeof value !== "string") {
        this.logger.debug(`Returning value as is for ${uniqueId}`);
        return value as T;
      }

      // Try to parse the string value intelligently
      if (value.toLowerCase() === "true") {
        return true as T;
      } else if (value.toLowerCase() === "false") {
        return false as T;
      } else if (!isNaN(Number(value))) {
        // Check if it's a valid number (integer or float)
        return Number(value) as T;
      } else {
        try {
          // Try to parse as JSON (for arrays or objects)
          return JSON.parse(value) as T;
        } catch {
          // If all else fails, return the string value
          return value as T;
        }
      }
    } else {
      this.logger.error(`Configuration answer not found for ${uniqueId}`);
      return defaultValue;
    }
  }
}
