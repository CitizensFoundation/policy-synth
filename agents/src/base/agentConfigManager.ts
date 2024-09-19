import { PolicySynthAgentBase } from "./agentBase.js";

export class PsConfigManager extends PolicySynthAgentBase{
  configuration: PsBaseNodeConfiguration;

  constructor(configuration: PsBaseNodeConfiguration) {
    super();
    this.configuration = configuration;
  }

  public getConfig<T>(uniqueId: string, defaultValue: T): T {
    if (uniqueId in this.configuration) {
      //@ts-ignore
      const value: unknown = this.configuration[uniqueId];
      //this.logger.debug(`Value for ${uniqueId}: ${value}`);

      // Check for null, undefined, or empty string and return defaultValue
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        this.logger.debug(`Empty value, returning default value for ${uniqueId}`);
        return defaultValue;
      }

      //this.logger.debug(`Type of value for ${uniqueId}: ${typeof value}`);

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

  public getConfigOld<T>(uniqueId: string, defaultValue: T): T {
    this.logger.debug(JSON.stringify(this.configuration, null, 2));
    const answer = this.configuration.answers?.find(
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

  public setConfig<T>(uniqueId: string, value: T): void {
    //@ts-ignore
    this.configuration[uniqueId] = value;
  }

  public getAllConfig(): PsBaseNodeConfiguration {
    return this.configuration;
  }

  public getModelUsageEstimates(): PsAgentModelUsageEstimate[] | undefined {
    return this.configuration.modelUsageEstimates;
  }

  public getApiUsageEstimates(): PsAgentApiUsageEstimate[] | undefined {
    return this.configuration.apiUsageEstimates;
  }

  public getMaxTokensOut(): number | undefined {
    return this.configuration.maxTokensOut;
  }

  public getTemperature(): number | undefined {
    return this.configuration.temperature;
  }

  public getAnswers(): YpStructuredAnswer[] | undefined {
    return this.configuration.answers;
  }
}