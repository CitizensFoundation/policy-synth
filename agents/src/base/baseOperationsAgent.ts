import winston from "winston";
import { PsConstants } from "./constants.js";
import { jsonrepair } from "jsonrepair";
import { BaseMessage } from "@langchain/core/messages";
import { Callbacks } from "@langchain/core/callbacks/manager";
import { BaseChatModel } from "./baseChatModel";
import { ClaudeOpusChat } from "./claudeOpusChat";
import { PsModelUsage } from "./models/PsModelUsage";
import { PsAgent } from "../dbModels/PsAgent.js";
import { PsAiModel } from "./models/PsAiModel";
import { Op } from "sequelize";
import { PolicySynthBaseAgent } from "./baseAgent.js";

export class PolicySynthOperationsAgent extends PolicySynthBaseAgent {
  agent: PsAgent;
  logger: winston.Logger;
  timeStart: number = Date.now();
  model: BaseChatModel | undefined;

  rateLimits: PsModelRateLimitTracking = {};

  constructor(agent: PsAgent) {
    super();
    this.agent = agent;
    this.logger = winston.createLogger({
      level: process.env.WORKER_LOG_LEVEL || "debug",
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
    this.initializeModel();
  }

  async initializeModel() {
    const aiModels = await this.agent.getAiModels();
    if (aiModels.length === 0) {
      throw new Error("No AI model associated with this agent");
    }
    const primaryModel = aiModels[0]; // Assume the first model is the primary one

    switch (primaryModel.configuration.type) {
      case PsAiModelType.Text:
        this.model = new ClaudeOpusChat({
          apiKey: primaryModel.configuration.apiKey,
          modelName: primaryModel.name,
          maxTokensOut: primaryModel.configuration.maxTokensOut || 4096,
        });
        break;
      // Add cases for other model types here
      default:
        throw new Error(`Unsupported model type: ${primaryModel.configuration.type}`);
    }
  }

  getJsonBlock(text: string) {
    let startIndex, endIndex;
    startIndex = text.indexOf("```json");
    endIndex = text.indexOf("```", startIndex + 6);
    if (endIndex !== -1) {
      let jsonContent = text.substring(startIndex + 7, endIndex).trim();
      return jsonContent;
    } else {
      throw new Error("Unable to find JSON block");
    }
  }

  repairJson(text: string): string {
    let repaired;
    try {
      repaired = jsonrepair(text);
    } catch (error) {
      this.logger.error(error);
      throw new Error("Unable to repair JSON");
    }
    return repaired;
  }

  parseJsonResponse(response: string): any {
    let parsedJson;

    response = response.replace("```json", "").trim();
    if (response.endsWith("```")) {
      response = response.substring(0, response.length - 3);
    }

    try {
      parsedJson = JSON.parse(response);
    } catch (error) {
      this.logger.warn(`Error parsing JSON ${response}`);
      try {
        this.logger.info(`Trying to fix JSON`);
        parsedJson = JSON.parse(this.repairJson(response));
        this.logger.info("Fixed JSON");
      } catch (error) {
        this.logger.warn(`Error parsing fixed JSON`);
        throw new Error("Unable to parse JSON");
      }
    }
    return parsedJson;
  }

  async saveTokenUsage(tokensIn: number, tokensOut: number) {
    if (!this.model) {
      throw new Error("Model not initialized");
    }

    try {
      const [usage, created] = await PsModelUsage.findOrCreate({
        where: {
          model_id: this.model.modelId,
          agent_id: this.agent.id,
          created_at: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) // Today's date
          }
        },
        defaults: {
          token_in_count: tokensIn,
          token_out_count: tokensOut,
        }
      });

      if (!created) {
        // If the record already existed, update the counters
        await usage.update({
          token_in_count: usage.token_in_count + tokensIn,
          token_out_count: usage.token_out_count + tokensOut,
        });
      }

      this.logger.info(`Token usage updated for agent ${this.agent.id} and model ${this.model.modelId}`);
    } catch (error) {
      this.logger.error("Error saving or updating token usage in database");
      this.logger.error(error);
    }
  }

  async callModel(
    stage: PsScMemoryStageTypes,
    messages: BaseMessage[],
    parseJson = true,
    limitedRetries = false,
    tokenOutEstimate = 120,
    streamingCallbacks?: Callbacks
  ) {
    if (!this.model) {
      throw new Error("Model not initialized");
    }

    try {
      let retryCount = 0;
      const maxRetries = limitedRetries
        ? PsConstants.limitedLLMmaxRetryCount
        : PsConstants.mainLLMmaxRetryCount;
      let retry = true;

      while (retry && retryCount < maxRetries) {
        try {
          const tokensIn = await this.model.getNumTokensFromMessages(messages);
          const estimatedTokensToAdd = tokensIn + tokenOutEstimate;

          await this.checkRateLimits(estimatedTokensToAdd);
          await this.updateRateLimits(tokensIn);

          const response = await this.model.generate(
            messages,
            !!streamingCallbacks,
            streamingCallbacks
          );

          if (response) {
            const tokensOut = await this.model.getNumTokensFromMessages([response]);

            await this.updateRateLimits(tokensOut);
            await this.saveTokenUsage(tokensIn, tokensOut);

            if (parseJson) {
              let parsedJson;
              try {
                parsedJson = this.parseJsonResponse(response.text.trim());
              } catch (error) {
                retryCount++;
                this.logger.warn(`Retrying callModel ${retryCount}`);
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
              return response.text.trim();
            }
          } else {
            retryCount++;
            this.logger.warn(`callModel response was empty, retrying`);
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
      this.logger.error("Unrecoverable Error in callModel method");
      this.logger.error(error);
      throw error;
    }
  }

  async updateRateLimits(tokensToAdd: number) {
    const now = Date.now();

    if (!this.model) {
      throw new Error("Model not initialized");
    }

    if (!this.rateLimits[this.model.modelName]) {
      this.rateLimits[this.model.modelName] = {
        requests: [],
        tokens: [],
      };
    }

    this.addRequestTimestamp();
    this.addTokenEntry(tokensToAdd);
  }

  async checkRateLimits(tokensToAdd: number) {
    if (!this.model) {
      throw new Error("Model not initialized");
    }

    let now = Date.now();
    const windowSize = 60000; // 60 seconds

    if (!this.rateLimits[this.model.modelName]) {
      this.rateLimits[this.model.modelName] = {
        requests: [],
        tokens: [],
      };
    }

    this.slideWindowForRequests();
    this.slideWindowForTokens();

    const limits = this.rateLimits[this.model.modelName];

    if (limits.requests.length >= this.model.limitRPM) {
      const remainingTimeRequests =
        60000 - (now - limits.requests[0].timestamp);
      this.logger.info(
        `RPM limit reached (${
          this.model.limitRPM
        }), sleeping for ${this.formatNumber(
          (remainingTimeRequests + 1000) / 1000
        )} seconds`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, remainingTimeRequests + 1000)
      );
    }

    now = Date.now();

    const currentTokensCount = limits.tokens.reduce(
      (acc, token) => acc + token.count,
      0
    );

    if (currentTokensCount + tokensToAdd > this.model.limitTPM) {
      const remainingTimeTokens = 60000 - (now - limits.tokens[0].timestamp);
      this.logger.info(
        `TPM limit reached (${
          this.model.limitTPM
        }), sleeping for ${this.formatNumber(
          (remainingTimeTokens + 1000) / 1000
        )} seconds`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, remainingTimeTokens + 1000)
      );
    }
  }

  formatNumber(number: number, fractions = 0) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: fractions,
    }).format(number);
  }

  addRequestTimestamp() {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    const now = Date.now();
    this.rateLimits[this.model.modelName].requests.push({ timestamp: now });
  }

  addTokenEntry(tokensToAdd: number) {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    const now = Date.now();
    this.rateLimits[this.model.modelName].tokens.push({
      count: tokensToAdd,
      timestamp: now,
    });
  }

  slideWindowForRequests() {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    const now = Date.now();
    const windowSize = 60000; // 60 seconds
    this.rateLimits[this.model.modelName].requests = this.rateLimits[this.model.modelName].requests.filter(
      (request) => now - request.timestamp < windowSize
    );
  }

  slideWindowForTokens() {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    const now = Date.now();
    const windowSize = 60000; // 60 seconds
    this.rateLimits[this.model.modelName].tokens = this.rateLimits[this.model.modelName].tokens.filter(
      (token) => now - token.timestamp < windowSize
    );
  }
}