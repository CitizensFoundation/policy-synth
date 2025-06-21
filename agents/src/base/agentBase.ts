import winston from "winston";
import { jsonrepair } from "jsonrepair";
import { encoding_for_model } from "tiktoken";
import { AirbrakeTransport } from "./winstonAirbrake.js";

export class PolicySynthAgentBase {
  timeStart: number = Date.now();

  private static _rootLogger: winston.Logger = PolicySynthAgentBase.initLogger();

  protected logger!: winston.Logger;

  private static initLogger(): winston.Logger {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ];

    if (process.env.AIRBRAKE_PROJECT_ID && process.env.AIRBRAKE_PROJECT_KEY) {
      transports.push(
        new AirbrakeTransport({
          level: "error",
          projectId: +process.env.AIRBRAKE_PROJECT_ID,
          projectKey: process.env.AIRBRAKE_PROJECT_KEY,
          environment: process.env.NODE_ENV,
        })
      );
    }

    return winston.createLogger({
      level: process.env.WINSTON_LOG_LEVEL || "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
    });
  }

  static get logger(): winston.Logger {
    return PolicySynthAgentBase._rootLogger.child({ component: this.name });
  }

  // ────────────────────────────────────────────────────────────────────────────
  constructor() {
    // make the instance reuse exactly the same child logger
    this.logger = (this.constructor as typeof PolicySynthAgentBase).logger;
    this.timeStart = Date.now();
  }

  protected createSystemMessage(content: string): PsModelMessage {
    return { role: "system", message: content.trim() };
  }

  protected createHumanMessage(content: string): PsModelMessage {
    return { role: "user", message: content.trim() };
  }

  getJsonBlock(text: string) {
    let startIndex = text.indexOf("```json");
    let endIndex = text.indexOf("```", startIndex + 6);
    if (endIndex !== -1) {
      return text.substring(startIndex + 7, endIndex).trim();
    } else {
      return null;
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

  parseJsonResponse<T = any>(response: string): T {
    this.logger.debug(`Attempting to parse JSON: ${response}`);

    if (this.getJsonBlock(response)) {
      response = this.getJsonBlock(response) as string;
      this.logger.debug("Extracted JSON from code block");
    } else {
      response = response.replace("```json", "").trim();
      if (response.endsWith("```")) {
        response = response.substring(0, response.length - 3);
      }
      this.logger.debug("Cleaned JSON string");
    }

    try {
      const parsed = JSON.parse(response);
      this.logger.info("Successfully parsed JSON");
      return parsed as T;
    } catch (error) {
      this.logger.warn(`Error parsing JSON: ${(error as Error).message}`);
      try {
        this.logger.info("Attempting to repair JSON");
        const repairedJson = this.repairJson(response);
        const parsed = JSON.parse(repairedJson);
        this.logger.info("Successfully parsed repaired JSON");
        return parsed as T;
      } catch (repairError) {
        this.logger.error(
          `Failed to repair JSON: ${(repairError as Error).message}`
        );
        throw new Error(
          `Unable to parse JSON: ${
            (repairError as Error).message
          }\nOriginal JSON: ${response}`
        );
      }
    }
  }

  formatNumber(number: number, fractions = 0) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: fractions,
    }).format(number);
  }

  async getTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    //TODO: Get the db model name from the agent
    const encoding = encoding_for_model("gpt-4o");
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

    totalTokens += 2;

    encoding.free();

    return totalTokens;
  }
}
