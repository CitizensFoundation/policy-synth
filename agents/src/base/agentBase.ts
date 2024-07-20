import winston from "winston";
import { jsonrepair } from "jsonrepair";
import { encoding_for_model } from "tiktoken";

export class PolicySynthAgentBase {
  logger: winston.Logger;
  timeStart: number = Date.now();

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
    return { role: "user", message: content };
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

    totalTokens += 2; // Every reply is primed with <im_start>assistant

    encoding.free(); // Free up the memory used by the encoder

    return totalTokens;
  }
}