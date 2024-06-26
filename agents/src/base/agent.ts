import winston from "winston";
import { jsonrepair } from "jsonrepair";

export class PolicySynthBaseAgent {
  logger: winston.Logger;
  timeStart: number = Date.now();
  rateLimits: PsModelRateLimitTracking = {};

  maxModelTokensOut?: number;
  modelTemperature?: number;

  constructor() {
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
  }

  protected createSystemMessage(content: string): PsModelMessage {
    return { role: "system", message: content };
  }

  protected createHumanMessage(content: string): PsModelMessage {
    return { role: "human", message: content };
  }

  getJsonBlock(text: string) {
    let startIndex = text.indexOf("```json");
    let endIndex = text.indexOf("```", startIndex + 6);
    if (endIndex !== -1) {
      return text.substring(startIndex + 7, endIndex).trim();
    } else {
      throw new Error("Unable to find JSON block");
    }
  }

  repairJson(text: string): string {
    try {
      return jsonrepair(text);
    } catch (error) {
      this.logger.error(error);
      throw new Error("Unable to repair JSON");
    }
  }

  parseJsonResponse(response: string): any {
    response = response.replace("```json", "").trim();
    if (response.endsWith("```")) {
      response = response.substring(0, response.length - 3);
    }

    try {
      return JSON.parse(response);
    } catch (error) {
      this.logger.warn(`Error parsing JSON ${response}`);
      try {
        this.logger.info(`Trying to fix JSON`);
        const parsedJson = JSON.parse(this.repairJson(response));
        this.logger.info("Fixed JSON");
        return parsedJson;
      } catch (error) {
        this.logger.warn(`Error parsing fixed JSON`);
        throw new Error("Unable to parse JSON");
      }
    }
  }

  async updateRateLimits(
    model: PsBaseAIModelConstants,
    tokensToAdd: number
  ) {
    if (!this.rateLimits[model.name]) {
      this.rateLimits[model.name] = {
        requests: [],
        tokens: [],
      };
    }

    this.addRequestTimestamp(model);
    this.addTokenEntry(model, tokensToAdd);
  }

  async checkRateLimits(
    model: PsBaseAIModelConstants,
    tokensToAdd: number
  ) {
    let now = Date.now();
    const windowSize = 60000; // 60 seconds

    if (!this.rateLimits[model.name]) {
      this.rateLimits[model.name] = {
        requests: [],
        tokens: [],
      };
    }

    this.slideWindowForRequests(model);
    this.slideWindowForTokens(model);

    const limits = this.rateLimits[model.name];

    if (limits.requests.length >= model.limitRPM) {
      const remainingTimeRequests =
        60000 - (now - limits.requests[0].timestamp);
      this.logger.info(
        `RPM limit reached (${
          model.limitRPM
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

    if (currentTokensCount + tokensToAdd > model.limitTPM) {
      const remainingTimeTokens = 60000 - (now - limits.tokens[0].timestamp);
      this.logger.info(
        `TPM limit reached (${
          model.limitTPM
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

  addRequestTimestamp(model: PsBaseAIModelConstants) {
    const now = Date.now();
    this.rateLimits[model.name].requests.push({ timestamp: now });
  }

  addTokenEntry(model: PsBaseAIModelConstants, tokensToAdd: number) {
    const now = Date.now();
    this.rateLimits[model.name].tokens.push({
      count: tokensToAdd,
      timestamp: now,
    });
  }

  slideWindowForRequests(model: PsBaseAIModelConstants) {
    const now = Date.now();
    const windowSize = 60000; // 60 seconds
    this.rateLimits[model.name].requests = this.rateLimits[model.name].requests.filter(
      (request) => now - request.timestamp < windowSize
    );
  }

  slideWindowForTokens(model: PsBaseAIModelConstants) {
    const now = Date.now();
    const windowSize = 60000; // 60 seconds
    this.rateLimits[model.name].tokens = this.rateLimits[model.name].tokens.filter(
      (token) => now - token.timestamp < windowSize
    );
  }

  async getTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    const tokens = await this.getTokensFromMessages(messages);
    return tokens;
  }
}