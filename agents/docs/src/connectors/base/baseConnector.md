# PsBaseConnector

The `PsBaseConnector` class is an abstract class that extends the `PolicySynthAgent` class. It provides a base implementation for connectors in the PolicySynth system, handling configuration and common utility methods.

## Properties

| Name            | Type                              | Description                                      |
|-----------------|-----------------------------------|--------------------------------------------------|
| connector       | PsAgentConnectorAttributes        | The connector attributes.                        |
| connectorClass  | PsAgentConnectorClassAttributes   | The connector class attributes.                  |
| skipAiModels    | boolean                           | Flag to skip AI models, default is `true`.       |

## Constructor

### `constructor`

Initializes a new instance of the `PsBaseConnector` class.

#### Parameters

| Name           | Type                              | Description                                      |
|----------------|-----------------------------------|--------------------------------------------------|
| connector      | PsAgentConnectorAttributes        | The connector attributes.                        |
| connectorClass | PsAgentConnectorClassAttributes   | The connector class attributes.                  |
| agent          | PsAgent                           | The agent instance.                              |
| memory         | PsAgentMemoryData \| undefined    | The memory data, optional.                       |
| startProgress  | number                            | The start progress, default is `0`.              |
| endProgress    | number                            | The end progress, default is `100`.              |

## Methods

### `static getConfigurationQuestions`

Returns the configuration questions for the connector.

#### Returns

| Type                        | Description                                      |
|-----------------------------|--------------------------------------------------|
| YpStructuredQuestionData[]  | Array of structured question data.               |

### `static getExtraConfigurationQuestions`

Returns extra configuration questions for the connector. This method can be overridden by subclasses to provide additional questions.

#### Returns

| Type                        | Description                                      |
|-----------------------------|--------------------------------------------------|
| YpStructuredQuestionData[]  | Array of extra structured question data.         |

### `get name`

Gets the name of the connector from the configuration.

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| string  | The name of the connector.                       |

### `get description`

Gets the description of the connector from the configuration.

#### Returns

| Type    | Description                                      |
|---------|--------------------------------------------------|
| string  | The description of the connector.                |

### `getConfig`

Gets a configuration value by its unique ID, with a default value if the configuration is not found.

#### Parameters

| Name          | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| uniqueId      | string  | The unique ID of the configuration.              |
| defaultValue  | T       | The default value to return if not found.        |

#### Returns

| Type  | Description                                      |
|-------|--------------------------------------------------|
| T     | The configuration value or the default value.    |

### `protected async retryOperation`

Retries an operation a specified number of times with a delay between attempts.

#### Parameters

| Name        | Type                | Description                                      |
|-------------|---------------------|--------------------------------------------------|
| operation   | () => Promise<T>    | The operation to retry.                          |
| maxRetries  | number              | The maximum number of retries, default is `3`.   |
| delay       | number              | The delay between retries in milliseconds, default is `1000`. |

#### Returns

| Type  | Description                                      |
|-------|--------------------------------------------------|
| T     | The result of the operation.                     |

## Example

```typescript
import { PsBaseConnector } from '@policysynth/agents/connectors/base/baseConnector.js';
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';

class CustomConnector extends PsBaseConnector {
  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "customField",
        text: "Custom Field",
        type: "textField",
        maxLength: 100,
        required: true,
      },
    ];
  }
}

const connectorAttributes = { /* ... */ };
const connectorClassAttributes = { /* ... */ };
const agent = new PsAgent(/* ... */);

const customConnector = new CustomConnector(connectorAttributes, connectorClassAttributes, agent);
console.log(customConnector.name);
console.log(customConnector.description);
```