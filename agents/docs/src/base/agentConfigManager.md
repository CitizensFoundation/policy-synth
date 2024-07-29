# PsConfigManager

The `PsConfigManager` class extends the `PolicySynthAgentBase` and is responsible for managing the configuration of a PolicySynth agent. It provides methods to get, set, and retrieve various configuration settings.

## Properties

| Name          | Type                    | Description                          |
|---------------|-------------------------|--------------------------------------|
| configuration | PsBaseNodeConfiguration | The configuration object for the agent. |

## Constructor

### `constructor(configuration: PsBaseNodeConfiguration)`

Creates an instance of `PsConfigManager`.

- **Parameters:**
  - `configuration` (PsBaseNodeConfiguration): The configuration object for the agent.

## Methods

### `getConfig<T>(uniqueId: string, defaultValue: T): T`

Retrieves a configuration value by its unique ID. If the value is not found or is invalid, it returns the provided default value.

- **Parameters:**
  - `uniqueId` (string): The unique identifier for the configuration value.
  - `defaultValue` (T): The default value to return if the configuration value is not found or is invalid.

- **Returns:** `T` - The configuration value or the default value.

### `getConfigOld<T>(uniqueId: string, defaultValue: T): T`

An older method to retrieve a configuration value by its unique ID. If the value is not found, it returns the provided default value.

- **Parameters:**
  - `uniqueId` (string): The unique identifier for the configuration value.
  - `defaultValue` (T): The default value to return if the configuration value is not found.

- **Returns:** `T` - The configuration value or the default value.

### `setConfig<T>(uniqueId: string, value: T): void`

Sets a configuration value by its unique ID.

- **Parameters:**
  - `uniqueId` (string): The unique identifier for the configuration value.
  - `value` (T): The value to set.

- **Returns:** `void`

### `getAllConfig(): PsBaseNodeConfiguration`

Retrieves the entire configuration object.

- **Returns:** `PsBaseNodeConfiguration` - The entire configuration object.

### `getModelUsageEstimates(): PsAgentModelUsageEstimate[] | undefined`

Retrieves the model usage estimates from the configuration.

- **Returns:** `PsAgentModelUsageEstimate[] | undefined` - The model usage estimates or `undefined` if not found.

### `getApiUsageEstimates(): PsAgentApiUsageEstimate[] | undefined`

Retrieves the API usage estimates from the configuration.

- **Returns:** `PsAgentApiUsageEstimate[] | undefined` - The API usage estimates or `undefined` if not found.

### `getMaxTokensOut(): number | undefined`

Retrieves the maximum number of tokens out from the configuration.

- **Returns:** `number | undefined` - The maximum number of tokens out or `undefined` if not found.

### `getTemperature(): number | undefined`

Retrieves the temperature setting from the configuration.

- **Returns:** `number | undefined` - The temperature setting or `undefined` if not found.

### `getAnswers(): YpStructuredAnswer[] | undefined`

Retrieves the structured answers from the configuration.

- **Returns:** `YpStructuredAnswer[] | undefined` - The structured answers or `undefined` if not found.

## Example

```typescript
import { PsConfigManager } from '@policysynth/agents/base/agentConfigManager.js';
import { PsBaseNodeConfiguration } from '@policysynth/agents/base/agentConfigManager.js';

const config: PsBaseNodeConfiguration = {
  graphPosX: 0,
  graphPosY: 0,
  name: "ExampleConfig"
};

const configManager = new PsConfigManager(config);

const maxTokensOut = configManager.getMaxTokensOut();
console.log(`Max Tokens Out: ${maxTokensOut}`);

const temperature = configManager.getTemperature();
console.log(`Temperature: ${temperature}`);
```

This example demonstrates how to create an instance of `PsConfigManager` and retrieve configuration values such as `maxTokensOut` and `temperature`.