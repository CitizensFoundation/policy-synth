# PsConfigManager

The `PsConfigManager` class is an extension of the `PolicySynthAgentBase` class, designed to manage configuration and memory for agents. It provides methods to retrieve and set configuration values, as well as to access model and API usage estimates.

## Properties

| Name          | Type                    | Description                                   |
|---------------|-------------------------|-----------------------------------------------|
| configuration | PsBaseNodeConfiguration | The configuration settings for the agent node.|
| memory        | PsAgentMemoryData       | The memory data associated with the agent.    |

## Methods

| Name                      | Parameters                                      | Return Type                        | Description                                                                 |
|---------------------------|-------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| `getValueFromOverride`    | `uniqueId: string`                              | `string \| number \| boolean \| undefined` | Retrieves a value from memory overrides based on a unique identifier.       |
| `getConfig`               | `uniqueId: string, defaultValue: T`             | `T`                               | Retrieves a configuration value, with intelligent parsing and default fallback. |
| `getConfigOld`            | `uniqueId: string, defaultValue: T`             | `T`                               | Retrieves a configuration value using an older method, with type conversion. |
| `setConfig`               | `uniqueId: string, value: T`                    | `void`                            | Sets a configuration value for a given unique identifier.                   |
| `getAllConfig`            |                                                 | `PsBaseNodeConfiguration`         | Returns all configuration settings.                                         |
| `getModelUsageEstimates`  |                                                 | `PsAgentModelUsageEstimate[] \| undefined` | Retrieves model usage estimates from the configuration.                     |
| `getApiUsageEstimates`    |                                                 | `PsAgentApiUsageEstimate[] \| undefined` | Retrieves API usage estimates from the configuration.                       |
| `getMaxTokensOut`         |                                                 | `number \| undefined`             | Retrieves the maximum number of tokens that can be output.                  |
| `getTemperature`          |                                                 | `number \| undefined`             | Retrieves the temperature setting from the configuration.                   |
| `getAnswers`              |                                                 | `YpStructuredAnswer[] \| undefined` | Retrieves structured answers from the configuration.                        |

## Example

```typescript
import { PsConfigManager } from '@policysynth/agents/base/agentConfigManager.js';

const configuration: PsBaseNodeConfiguration = {
  graphPosX: 0,
  graphPosY: 0,
  name: "ExampleConfig",
  // other configuration properties...
};

const memory: PsAgentMemoryData = {
  agentId: 123,
  // other memory properties...
};

const configManager = new PsConfigManager(configuration, memory);

const maxTokens = configManager.getMaxTokensOut();
console.log(`Max Tokens Out: ${maxTokens}`);

const temperature = configManager.getTemperature();
console.log(`Temperature: ${temperature}`);
```

This class provides a structured way to manage and access configuration and memory data for agents, with methods to handle overrides, defaults, and type conversions.