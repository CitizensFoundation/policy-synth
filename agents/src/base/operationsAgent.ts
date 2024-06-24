import ioredis from "ioredis";

import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { ClaudeChat } from "../aiModels/claudeChat.js";
import { OpenAiChat } from "../aiModels/openAiChat.js";
import { GoogleGeminiChat } from "../aiModels/googleGeminiChat.js";
import { AzureOpenAiChat } from "../aiModels/azureOpenAiChat.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAgent } from "../dbModels/agent.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { Op } from "sequelize";
import { PolicySynthBaseAgent } from "./agent.js";

//TODO: Look to pool redis connections
const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

export class PolicySynthOperationsAgent extends PolicySynthBaseAgent {
  memory!: PsAgentMemoryData;
  agent: PsAgent;
  models: Map<PsAiModelType, BaseChatModel> = new Map();

  limitedLLMmaxRetryCount = 3;
  mainLLMmaxRetryCount = 10;

  rateLimits: PsModelRateLimitTracking = {};

  constructor(
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined
  ) {
    super();
    this.agent = agent;
    this.initializeModels();
    if (memory) {
      this.memory = memory;
    } else {
      this.loadAgentMemoryFromRedis();
    }
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
      throw new Error("No AI models associated with this agent");
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
        modelName: model.name,
        maxTokensOut:
          this.maxModelTokensOut ??
          this.agent.configuration.maxTokensOut ??
          model.configuration.maxTokensOut ??
          4096,
        temperature:
          this.modelTemperature ??
          this.agent.configuration.temperature ??
          model.configuration.defaultTemperature ??
          0.5,
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
    const model = this.models.get(modelType);
    if (!model) {
      throw new Error(`Model of type ${modelType} not initialized`);
    }

    try {
      const [usage, created] = await PsModelUsage.findOrCreate({
        where: {
          //TODO: Check this make more robust
          model_id: this.agent.AiModels!.find(
            (m) => m.name === model.modelName
          )!.id,
          agent_id: this.agent.id,
          created_at: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)), // Today's date
          },
        },
        defaults: {
          token_in_count: tokensIn,
          token_out_count: tokensOut,
          model_id: this.agent.AiModels!.find(
            (m) => m.name === model.modelName
          )!.id,
          agent_id: this.agent.id,
          user_id: this.agent.user_id,
        },
      });

      if (!created) {
        // If the record already existed, update the counters
        await usage.update({
          token_in_count: usage.token_in_count + tokensIn,
          token_out_count: usage.token_out_count + tokensOut,
        });
      }

      this.logger.info(
        `Token usage updated for agent ${this.agent.id} and model ${model.modelName}`
      );
    } catch (error) {
      this.logger.error("Error saving or updating token usage in database");
      this.logger.error(error);
    }
  }

  formatNumber(number: number, fractions = 0) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: fractions,
    }).format(number);
  }

  async updateMemoryStatus(progress: number, message: string) {
    if (!this.memory.status) {
      this.memory.status = {
        state: "processing",
        progress: 0,
        messages: [],
        lastUpdated: Date.now(),
      };
    }

    this.memory.status.progress = progress;
    this.memory.status.messages.push(message);
    this.memory.status.lastUpdated = Date.now();

    // Save updated memory to Redis
    await this.saveMemoryToRedis();
  }

  async saveMemoryToRedis() {
    try {
      await redis.set(this.agent.redisMemoryKey, JSON.stringify(this.memory));
    } catch (error) {
      this.logger.error("Error saving agent memory to Redis");
      this.logger.error(error);
    }
  }
}
