import { PolicySynthAgent } from "../../base/agent.js";
import { PsAgent } from "../../dbModels/agent.js";

export abstract class PsBaseConnector extends PolicySynthAgent {
  connector: PsAgentConnectorAttributes;
  connectorClass: PsAgentConnectorClassAttributes;
  skipAiModels = true;

  constructor(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    startProgress = 0,
    endProgress = 100
  ) {
    super(agent, memory, startProgress, endProgress);
    this.connector = connector;
    this.connectorClass = connectorClass;
  }

  static getConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "name",
        text: "Name",
        type: "textField",
        maxLength: 200,
        required: true,
      },
      {
        uniqueId: "description",
        text: "Description",
        type: "textArea",
        maxLength: 500,
        required: false,
      },
      ...this.getExtraConfigurationQuestions(),
    ];
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [];
  }

  get name(): string {
    return this.getConfig("name", "");
  }

  get description(): string {
    return this.getConfig("description", "");
  }

  getConfig<T>(uniqueId: string, defaultValue: T): T {
    if (uniqueId in this.connector.configuration) {
      //TODO: Look into this
      //@ts-ignore
      const value: unknown = this.connector.configuration[uniqueId];
      this.logger.debug(`Value for ${uniqueId}: ${value}`);

      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        this.logger.debug(`Returning default value for ${uniqueId}`);
        return defaultValue;
      }

      this.logger.debug(`Type of value for ${uniqueId}: ${typeof value}`);

      if (typeof value !== "string") {
        this.logger.debug(`Returning value as is for ${uniqueId}`);
        return value as T;
      }

      if (value.toLowerCase() === "true") {
        return true as T;
      } else if (value.toLowerCase() === "false") {
        return false as T;
      } else if (!isNaN(Number(value))) {
        return Number(value) as T;
      } else {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      }
    } else {
      this.logger.error(`Configuration answer not found for ${uniqueId}`);
      return defaultValue;
    }
  }


  // Common utility methods can be implemented here
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries reached");
  }
}