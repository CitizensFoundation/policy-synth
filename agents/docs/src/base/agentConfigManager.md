# PsConfigManager

The `PsConfigManager` class is responsible for managing the configuration of a PolicySynth agent. It extends the `PolicySynthAgentBase` class and provides methods to get, set, and retrieve various configuration settings.

## Properties

| Name           | Type                    | Description                        |
|----------------|-------------------------|------------------------------------|
| configuration  | PsBaseNodeConfiguration | The configuration object for the agent. |

## Constructor

### `constructor(configuration: PsBaseNodeConfiguration)`

Creates an instance of `PsConfigManager`.

| Parameter     | Type                    | Description                        |
|---------------|-------------------------|------------------------------------|
| configuration | PsBaseNodeConfiguration | The initial configuration object.  |

## Methods

### `getConfig<T>(uniqueId: string, defaultValue: T): T`

Retrieves a configuration value by its unique ID. If the value is not found or is invalid, it returns the provided default value.

| Parameter     | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| uniqueId      | string | The unique identifier for the configuration item.|
| defaultValue  | T      | The default value to return if the item is not found or invalid. |

| Return Type   | Description                                      |
|---------------|--------------------------------------------------|
| T             | The configuration value or the default value.    |

### `getConfigOld<T>(uniqueId: string, defaultValue: T): T`

An older method to retrieve a configuration value by its unique ID. It also returns the provided default value if the item is not found.

| Parameter     | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| uniqueId      | string | The unique identifier for the configuration item.|
| defaultValue  | T      | The default value to return if the item is not found or invalid. |

| Return Type   | Description                                      |
|---------------|--------------------------------------------------|
| T             | The configuration value or the default value.    |

### `setConfig<T>(uniqueId: string, value: T): void`

Sets a configuration value by its unique ID.

| Parameter     | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| uniqueId      | string | The unique identifier for the configuration item.|
| value         | T      | The value to set for the configuration item.     |

| Return Type   | Description                                      |
|---------------|--------------------------------------------------|
| void          | This method does not return a value.             |

### `getAllConfig(): PsBaseNodeConfiguration`

Retrieves the entire configuration object.

| Return Type               | Description                                      |
|---------------------------|--------------------------------------------------|
| PsBaseNodeConfiguration   | The entire configuration object.                 |

### `getModelUsageEstimates(): PsAgentModelUsageEstimate[] | undefined`

Retrieves the model usage estimates from the configuration.

| Return Type                       | Description                                      |
|-----------------------------------|--------------------------------------------------|
| PsAgentModelUsageEstimate[]       | An array of model usage estimates or undefined.  |

### `getApiUsageEstimates(): PsAgentApiUsageEstimate[] | undefined`

Retrieves the API usage estimates from the configuration.

| Return Type                       | Description                                      |
|-----------------------------------|--------------------------------------------------|
| PsAgentApiUsageEstimate[]         | An array of API usage estimates or undefined.    |

### `getMaxTokensOut(): number | undefined`

Retrieves the maximum number of tokens out from the configuration.

| Return Type   | Description                                      |
|---------------|--------------------------------------------------|
| number        | The maximum number of tokens out or undefined.   |

### `getTemperature(): number | undefined`

Retrieves the temperature setting from the configuration.

| Return Type   | Description                                      |
|---------------|--------------------------------------------------|
| number        | The temperature setting or undefined.            |

### `getAnswers(): YpStructuredAnswer[] | undefined`

Retrieves the structured answers from the configuration.

| Return Type               | Description                                      |
|---------------------------|--------------------------------------------------|
| YpStructuredAnswer[]      | An array of structured answers or undefined.     |

## Example

```typescript
import { PsConfigManager } from '@policysynth/agents/base/agentConfigManager.js';

const config: PsBaseNodeConfiguration = {
  graphPosX: 0,
  graphPosY: 0,
  maxTokensOut: 1000,
  temperature: 0.7,
  answers: [
    { uniqueId: 'example', value: 'exampleValue' }
  ]
};

const configManager = new PsConfigManager(config);

const maxTokens = configManager.getMaxTokensOut();
console.log(`Max Tokens Out: ${maxTokens}`);

const temperature = configManager.getTemperature();
console.log(`Temperature: ${temperature}`);

const exampleAnswer = configManager.getConfig<string>('example', 'default');
console.log(`Example Answer: ${exampleAnswer}`);
```

This example demonstrates how to create an instance of `PsConfigManager`, retrieve configuration values, and log them to the console.