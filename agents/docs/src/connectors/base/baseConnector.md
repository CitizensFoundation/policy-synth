# PsBaseConnector

The `PsBaseConnector` class is an abstract class that extends the `PolicySynthAgent` class. It serves as a base class for creating connectors in the PolicySynth system.

## Properties

| Name            | Type                              | Description                                      |
|-----------------|-----------------------------------|--------------------------------------------------|
| connector       | PsAgentConnectorAttributes        | The connector attributes.                        |
| connectorClass  | PsAgentConnectorClassAttributes   | The connector class attributes.                  |
| skipAiModels    | boolean                           | Flag to skip AI models, default is `true`.       |

## Constructor

### PsBaseConnector

Constructs a new instance of the `PsBaseConnector` class.

#### Parameters

| Name          | Type                              | Description                                      |
|---------------|-----------------------------------|--------------------------------------------------|
| connector     | PsAgentConnectorAttributes        | The connector attributes.                        |
| connectorClass| PsAgentConnectorClassAttributes   | The connector class attributes.                  |
| agent         | PsAgent                           | The agent instance.                              |
| memory        | PsAgentMemoryData \| undefined    | The memory data, optional.                       |
| startProgress | number                            | The start progress, default is `0`.              |
| endProgress   | number                            | The end progress, default is `100`.              |

## Methods

### getConfigurationQuestions

Returns the configuration questions for the connector.

#### Returns

| Type                        | Description                                      |
|-----------------------------|--------------------------------------------------|
| YpStructuredQuestionData[]  | Array of structured question data.               |

### getExtraConfigurationQuestions

Returns extra configuration questions for the connector. This method can be overridden by subclasses to provide additional questions.

#### Returns

| Type                        | Description                                      |
|-----------------------------|--------------------------------------------------|
| YpStructuredQuestionData[]  | Array of extra structured question data.         |

### name

Getter for the name configuration.

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| string  | The name configuration value.                    |

### description

Getter for the description configuration.

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| string  | The description configuration value.             |

### getConfig

Retrieves a configuration value based on the unique ID.

#### Parameters

| Name          | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| uniqueId      | string  | The unique ID of the configuration.              |
| defaultValue  | T       | The default value to return if not found.        |

#### Returns

| Type  | Description                                      |
|-------|--------------------------------------------------|
| T     | The configuration value or the default value.    |

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
}
```