import winston from "winston";
import { jsonrepair } from "jsonrepair";
import { encoding_for_model } from "tiktoken";
import { AirbrakeTransport } from "./winstonAirbrake.js";

const REDACTED_LOG_VALUE = "[REDACTED]";

type RedactableLogObject = Record<PropertyKey, unknown>;

export class PolicySynthAgentBase {
  timeStart: number = Date.now();

  private static _rootLogger: winston.Logger = PolicySynthAgentBase.initLogger();

  protected logger!: winston.Logger;

  private static initLogger(): winston.Logger {
    const redactSecrets = winston.format((info) =>
      PolicySynthAgentBase.redactLogValue(info) as winston.Logform.TransformableInfo
    );
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ];

    if (process.env.AIRBRAKE_PROJECT_ID && process.env.AIRBRAKE_PROJECT_KEY) {
      const ignored = process.env.AIRBRAKE_IGNORED_ERRORS
        ? process.env.AIRBRAKE_IGNORED_ERRORS.split(',').map((e) => e.trim()).filter(Boolean)
        : [];
      transports.push(
        new AirbrakeTransport({
          level: "error",
          projectId: +process.env.AIRBRAKE_PROJECT_ID,
          projectKey: process.env.AIRBRAKE_PROJECT_KEY,
          environment: process.env.NODE_ENV,
          ignoredErrorMessages: ignored,
        })
      );
    }

    return winston.createLogger({
      level: process.env.WINSTON_LOG_LEVEL || "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        redactSecrets(),
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

  private static isSensitiveLogKey(key: string): boolean {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const exactSensitiveKeys = new Set([
      "apikey",
      "authorization",
      "proxyauthorization",
      "xapikey",
      "xgoogapikey",
      "accesstoken",
      "refreshtoken",
      "idtoken",
      "clientsecret",
      "projectkey",
      "secret",
      "password",
      "token",
      "bearer",
      "awsbearertokenbedrock",
    ]);

    return exactSensitiveKeys.has(normalizedKey) ||
      normalizedKey.endsWith("apikey") ||
      normalizedKey.endsWith("token") ||
      normalizedKey.endsWith("secret") ||
      normalizedKey.endsWith("password") ||
      normalizedKey.endsWith("projectkey");
  }

  private static getEnumerableLogKeys(value: object): Array<string | symbol> {
    return [
      ...Object.keys(value),
      ...Object.getOwnPropertySymbols(value).filter((symbolKey) =>
        Object.prototype.propertyIsEnumerable.call(value, symbolKey)
      ),
    ];
  }

  private static redactSensitiveText(text: string): string {
    const sensitiveKeyValuePattern =
      /((?:["']?)(?:api[-_ ]?key|x[-_ ]?api[-_ ]?key|x[-_ ]?goog[-_ ]?api[-_ ]?key|authorization|proxy[-_ ]?authorization|access[-_ ]?token|refresh[-_ ]?token|id[-_ ]?token|client[-_ ]?secret|project[-_ ]?key|secret|password|token|bearer)(?:["']?)\s*[:=]\s*)(?:"([^"]*)"|'([^']*)'|([^"',\s}\]]+))/gi;
    const envApiKeyPattern =
      /((?:OPENAI_API_KEY|ANTHROPIC_API_KEY|GOOGLE_API_KEY|GEMINI_API_KEY|AZURE_API_KEY|AZURE_OPENAI_KEY|PS_AGENT_OVERRIDE_OPENAI_API_KEY|PS_AGENT_GEMINI_API_KEY|AI_MODEL_API_KEY|AWS_BEARER_TOKEN_BEDROCK|AIRBRAKE_PROJECT_KEY)\s*[:=]\s*)(?:"([^"]*)"|'([^']*)'|([^"',\s}\]]+))/g;
    const authorizationPattern =
      /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;
    const commonApiKeyPattern =
      /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{12,}|sk-ant-[A-Za-z0-9_-]{12,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z._-]+)\b/g;
    const queryApiKeyPattern =
      /([?&](?:api[_-]?key|apikey|key|token|access_token|client_secret)=)[^&\s]+/gi;

    return text
      .replace(
        sensitiveKeyValuePattern,
        (_match, prefix: string, doubleQuoted: string | undefined, singleQuoted: string | undefined) => {
          const quote = doubleQuoted !== undefined
            ? '"'
            : singleQuoted !== undefined
              ? "'"
              : "";
          return `${prefix}${quote}${REDACTED_LOG_VALUE}${quote}`;
        }
      )
      .replace(
        envApiKeyPattern,
        (_match, prefix: string, doubleQuoted: string | undefined, singleQuoted: string | undefined) => {
          const quote = doubleQuoted !== undefined
            ? '"'
            : singleQuoted !== undefined
              ? "'"
              : "";
          return `${prefix}${quote}${REDACTED_LOG_VALUE}${quote}`;
        }
      )
      .replace(
        authorizationPattern,
        (_match, scheme: string) => `${scheme} ${REDACTED_LOG_VALUE}`
      )
      .replace(commonApiKeyPattern, REDACTED_LOG_VALUE)
      .replace(
        queryApiKeyPattern,
        (_match, prefix: string) => `${prefix}${REDACTED_LOG_VALUE}`
      );
  }

  private static redactLogValue(
    value: unknown,
    seen: WeakSet<object> = new WeakSet()
  ): unknown {
    if (typeof value === "string") {
      return PolicySynthAgentBase.redactSensitiveText(value);
    }

    if (value === null || typeof value !== "object") {
      return value;
    }

    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);

    if (value instanceof Error) {
      const redactedError: RedactableLogObject = {
        name: value.name,
        message: PolicySynthAgentBase.redactSensitiveText(value.message),
      };
      if (value.stack) {
        redactedError.stack = PolicySynthAgentBase.redactSensitiveText(
          value.stack
        );
      }

      for (const key of PolicySynthAgentBase.getEnumerableLogKeys(value)) {
        if (key === "name" || key === "message" || key === "stack") {
          continue;
        }
        const keyName = typeof key === "string" ? key : key.description ?? "";
        redactedError[key] = PolicySynthAgentBase.isSensitiveLogKey(keyName)
          ? REDACTED_LOG_VALUE
          : PolicySynthAgentBase.redactLogValue(
              (value as unknown as RedactableLogObject)[key],
              seen
            );
      }

      return redactedError;
    }

    if (Array.isArray(value)) {
      return value.map((item) => PolicySynthAgentBase.redactLogValue(item, seen));
    }

    const redactedObject: RedactableLogObject = {};
    for (const key of PolicySynthAgentBase.getEnumerableLogKeys(value)) {
      const keyName = typeof key === "string" ? key : key.description ?? "";
      redactedObject[key] = PolicySynthAgentBase.isSensitiveLogKey(keyName)
        ? REDACTED_LOG_VALUE
        : PolicySynthAgentBase.redactLogValue(
            (value as RedactableLogObject)[key],
            seen
          );
    }

    return redactedObject;
  }

  protected createSystemMessage(content: string): PsModelMessage {
    return { role: "system", message: content.trim() };
  }

  protected createHumanMessage(content: string): PsModelMessage {
    return { role: "user", message: content.trim() };
  }

  getJsonBlock(text: string) {
    const startIndex = text.indexOf("```json");
    if (startIndex === -1) {
      return null;
    }

    const endIndex = text.indexOf("```", startIndex + 7);
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
      this.logger.debug("Successfully parsed JSON from AI model");
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
          `Failed to repair JSON, retrying: ${(repairError as Error).message}`
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
