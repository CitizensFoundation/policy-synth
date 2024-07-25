# PsBaseConnector

The `PsBaseConnector` class is an abstract class that extends the `PolicySynthAgent` class. It provides a base implementation for connectors in the PolicySynth system, handling common configuration and utility methods.

## Properties

| Name            | Type                              | Description                                      |
|-----------------|-----------------------------------|--------------------------------------------------|
| connector       | PsAgentConnectorAttributes        | The connector instance associated with this class. |
| connectorClass  | PsAgentConnectorClassAttributes   | The class attributes of the connector.           |
| skipAiModels    | boolean                           | Flag to skip AI models, default is `true`.       |

## Constructor

### PsBaseConnector

Creates an instance of `PsBaseConnector`.

#### Parameters

| Name          | Type                              | Description                                      |
|---------------|-----------------------------------|--------------------------------------------------|
| connector     | PsAgentConnectorAttributes        | The connector instance associated with this class. |
| connectorClass| PsAgentConnectorClassAttributes   | The class attributes of the connector.           |
| agent         | PsAgent                           | The agent instance associated with this connector. |
| memory        | PsAgentMemoryData \| undefined    | Optional memory data for the agent.              |
| startProgress | number                            | Optional start progress value, default is `0`.   |
| endProgress   | number                            | Optional end progress value, default is `100`.   |

## Methods

### getConfigurationQuestions

Returns the configuration questions for the connector.

#### Returns

| Type                        | Description                                      |
|-----------------------------|--------------------------------------------------|
| YpStructuredQuestionData[]  | Array of structured question data for configuration. |

### getExtraConfigurationQuestions

Returns additional configuration questions for the connector. This method can be overridden by subclasses to provide extra questions.

#### Returns

| Type                        | Description                                      |
|-----------------------------|--------------------------------------------------|
| YpStructuredQuestionData[]  | Array of extra structured question data for configuration. |

### name

Getter for the name of the connector.

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| string  | The name of the connector.                       |

### description

Getter for the description of the connector.

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| string  | The description of the connector.                |

### getConfig

Retrieves the configuration value for a given unique ID.

#### Parameters

| Name          | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| uniqueId      | string  | The unique ID of the configuration.              |
| defaultValue  | T       | The default value to return if the configuration is not found. |

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| T       | The configuration value for the given unique ID. |

### retryOperation

Retries a given operation a specified number of times with a delay between attempts.

#### Parameters

| Name        | Type          | Description                                      |
|-------------|---------------|--------------------------------------------------|
| operation   | () => Promise<T> | The operation to retry.                        |
| maxRetries  | number        | Optional maximum number of retries, default is `3`. |
| delay       | number        | Optional delay between retries in milliseconds, default is `1000`. |

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| Promise<T> | The result of the operation if successful.    |

#### Throws

| Type    | Description                                      |
|---------|--------------------------------------------------|
| Error   | If the maximum number of retries is reached.     |

## Example

```typescript
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";
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
```