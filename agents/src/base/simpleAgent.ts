import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { ClaudeChat } from "../aiModels/claudeChat.js";
import { OpenAiChat } from "../aiModels/openAiChat.js";
import { GoogleGeminiChat } from "../aiModels/googleGeminiChat.js";
import { AzureOpenAiChat } from "../aiModels/azureOpenAiChat.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import ioredis from "ioredis";
import tiktoken from "tiktoken";
import { PsAiModelType } from "../aiModelTypes.js";

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || process.env.REDIS_URL || "redis://localhost:6379"
);

export class PolicySynthSimpleAgentBase extends PolicySynthAgentBase {
  declare memory?: PsSimpleAgentMemoryData;
  timeStart: number = Date.now();
  rateLimits: PsModelRateLimitTracking = {};
  models: Map<PsAiModelType, BaseChatModel> = new Map();
  private tokenizer: tiktoken.Tiktoken | null = null;
  needsAiModel = true;

  maxModelTokensOut = 4096;
  modelTemperature = 0.7;

  constructor(memory: PsSimpleAgentMemoryData | undefined = undefined) {
    super();
    if (memory) {
      this.memory = memory;
    }
    this.initializeTokenizer();
    if (this.needsAiModel) {
      this.initializeModels();
    }
  }

  private initializeTokenizer() {
    try {
      const modelName = process.env.AI_MODEL_NAME || "gpt-3.5-turbo";
      this.tokenizer = tiktoken.encoding_for_model(modelName as tiktoken.TiktokenModel);
    } catch (error) {
      this.logger.error("Failed to initialize tokenizer", error);
    }
  }

  private getTokenizer(): tiktoken.Tiktoken {
    if (!this.tokenizer) {
      this.initializeTokenizer();
      if (!this.tokenizer) {
        throw new Error("Failed to initialize tokenizer");
      }
    }
    return this.tokenizer;
  }

  protected getNumTokensFromMessages(messages: PsModelMessage[]): number {
    try {
      const tokenizer = this.getTokenizer();
      let tokenCount = 0;
      for (const message of messages) {
        tokenCount += tokenizer.encode(message.role).length;
        tokenCount += tokenizer.encode(message.message).length;
        tokenCount += 3; // Every message follows <im_start>{role/name}\n{content}<im_end>\n
      }
      tokenCount += 3; // Every reply is primed with <im_start>assistant
      return tokenCount;
    } catch (error) {
      this.logger.warn("Error in token counting, using approximate count", error);
      return this.getApproximateTokenCount(JSON.stringify(messages));
    }
  }

  protected getNumTokensFromText(text: string): number {
    try {
      const tokenizer = this.getTokenizer();
      return tokenizer.encode(text).length;
    } catch (error) {
      this.logger.warn("Error in token counting, using approximate count", error);
      return this.getApproximateTokenCount(text);
    }
  }

  private getApproximateTokenCount(text: string): number {
    // Approximate token count based on words (assuming average of 4 characters per token)
    return Math.ceil(text.length / 4);
  }

  initializeModels() {
    if (
      !process.env.AI_MODEL_API_KEY ||
      !process.env.AI_MODEL_NAME ||
      !process.env.AI_MODEL_PROVIDER
    ) {
      //TODO: this should not happen on all agents that have this.needsAiModel = false
      this.logger.error("Memory or AI model configuration not found");
      return;
    }

    const baseConfig: PsAiModelConfig = {
      apiKey: process.env.AI_MODEL_API_KEY!,
      modelName: process.env.AI_MODEL_NAME,
      maxTokensOut: this.maxModelTokensOut ??
        (process.env.AI_MODEL_MAX_TOKENS_OUT
          ? parseInt(process.env.AI_MODEL_MAX_TOKENS_OUT)
          : 4096),
      temperature: this.modelTemperature ??
        (process.env.AI_MODEL_TEMPERATURE
          ? parseFloat(process.env.AI_MODEL_TEMPERATURE)
          : 0.5),
    };

    switch (process.env.AI_MODEL_PROVIDER.toLowerCase()) {
      case "anthropic":
        this.models.set(PsAiModelType.Text, new ClaudeChat(baseConfig));
        break;
      case "openai":
        this.models.set(PsAiModelType.Text, new OpenAiChat(baseConfig));
        break;
      case "google":
        this.models.set(PsAiModelType.Text, new GoogleGeminiChat(baseConfig));
        break;
      case "azure":
        this.models.set(
          PsAiModelType.Text,
          new AzureOpenAiChat({
            ...baseConfig,
            endpoint: process.env.AZURE_ENDPOINT!,
            deploymentName: process.env.AZURE_DEPLOYMENT_NAME!,
          })
        );
        break;
      default:
        throw new Error(
          `Unsupported model provider: ${process.env.AI_MODEL_PROVIDER}`
        );
    }
  }

  async callLLM(
    stage: string,
    messages: PsModelMessage[],
    parseJson = true,
    tokenOutEstimate = 120,
    streamingCallbacks?: Function
  ) {
    const model = this.models.get(PsAiModelType.Text);
    if (!model) {
      throw new Error(`No model available for type ${PsAiModelType.Text}`);
    }

    try {
      let retryCount = 0;
      const maxRetries = process.env.PS_LLM_MAX_LIMITED_RETRY_COUNT
        ? parseInt(process.env.PS_LLM_MAX_LIMITED_RETRY_COUNT)
        : 5;
      let retry = true;

      while (retry && retryCount < maxRetries) {
        try {

          // TODO: Implement rate limiting
          // await this.checkRateLimits(PsAiModelType.Text, estimatedTokensToAdd);
          // await this.updateRateLimits(PsAiModelType.Text, tokensIn);

          const response = await model.generate(
            messages,
            !!streamingCallbacks,
            streamingCallbacks
          );

          if (response) {
            const {tokensIn, tokensOut, content} = response;

            // await this.updateRateLimits(PsAiModelType.Text, tokensOut);
            this.updateMemoryStages(stage, tokensIn, tokensOut, model);
            await this.saveMemory();

            if (parseJson) {
              let parsedJson;
              try {
                parsedJson = this.parseJsonResponse(content.trim());
              } catch (error) {
                retryCount++;
                this.logger.warn(`Retrying callLLM ${retryCount}`);
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
              return content.trim();
            }
          } else {
            retryCount++;
            this.logger.warn(`callLLM response was empty, retrying`);
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
      this.logger.error("Unrecoverable Error in callLLM method");
      this.logger.error(error);
      throw error;
    }
  }

  updateMemoryStages(
    stage: string,
    tokensIn: number,
    tokensOut: number,
    model: BaseChatModel
  ) {
    if (this.memory!.stages) {
      if (!this.memory!.stages[stage]) {
        this.memory!.stages[stage] = {
          tokensIn: 0,
          tokensOut: 0,
          tokensInCost: 0,
          tokensOutCost: 0,
        };
      }

      if (process.env.PS_MODEL_IN_COST_USD && process.env.PS_MODEL_OUT_COST_USD) {
        const inTokenCost = parseFloat(process.env.PS_MODEL_IN_COST_USD);
        const outTokenCost = parseFloat(process.env.PS_MODEL_OUT_COST_USD);

        this.memory!.stages[stage].tokensIn! += tokensIn;
        this.memory!.stages[stage].tokensOut! += tokensOut;
        this.memory!.stages[stage].tokensInCost! += tokensIn * inTokenCost;
        this.memory!.stages[stage].tokensOutCost! += tokensOut * outTokenCost;

        // Update total cost
        this.memory!.totalCost =
          (this.memory!.totalCost || 0) +
          tokensIn * inTokenCost +
          tokensOut * outTokenCost;
      } else {
        this.logger.warn(
          "Cost per token not set in environment variables PS_MODEL_IN_COST_USD and PS_MODEL_OUT_COST_USD"
        );
      }
    } else {
      console.warn("Memory is not initialized");
    }
  }

  get redisKey() {
    return `ps-simple-agent-memory-for-group-id-${this.memory!.groupId}`;
  }

  async saveMemory() {
    if (this.memory) {
      try {
        this.memory.lastSavedAt = Date.now();
        await redis.set(this.redisKey, JSON.stringify(this.memory));
      } catch (error) {
        this.logger.error("Can't save memory to redis", error);
      }
    } else {
      this.logger.warn("Memory is not initialized");
    }
  }

  get fullLLMCostsForMemory() {
    return this.memory?.totalCost || 0;
  }
}