# PsConfigManager

The `PsConfigManager` class is an extension of the `PolicySynthAgentBase` class, designed to manage configuration and memory for agents. It provides methods to retrieve and set configuration values, as well as to access model and API usage estimates.

## Properties

| Name          | Type                    | Description                                      |
|---------------|-------------------------|--------------------------------------------------|
| configuration | PsBaseNodeConfiguration | The configuration object for the agent.          |
| memory        | PsAgentMemoryData       | The memory data associated with the agent.       |

## Methods

| Name                      | Parameters                                      | Return Type                        | Description                                                                 |
|---------------------------|-------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| constructor               | configuration: PsBaseNodeConfiguration, memory: PsAgentMemoryData | void                               | Initializes a new instance of the `PsConfigManager` class.                  |
| getValueFromOverride      | uniqueId: string                                | string \| number \| boolean \| undefined | Retrieves a value from the memory's structured answers overrides.           |
| getConfig                 | uniqueId: string, defaultValue: T               | T                                  | Retrieves a configuration value, with intelligent parsing of string values. |
| getConfigOld              | uniqueId: string, defaultValue: T               | T                                  | Retrieves a configuration value using the old method.                       |
| setConfig                 | uniqueId: string, value: T                      | void                               | Sets a configuration value.                                                 |
| getAllConfig              |                                                 | PsBaseNodeConfiguration            | Returns the entire configuration object.                                    |
| getModelUsageEstimates    |                                                 | PsAgentModelUsageEstimate[] \| undefined | Retrieves model usage estimates from the configuration.                     |
| getApiUsageEstimates      |                                                 | PsAgentApiUsageEstimate[] \| undefined | Retrieves API usage estimates from the configuration.                       |
| getMaxTokensOut           |                                                 | number \| undefined                | Retrieves the maximum tokens out value from the configuration.              |
| getTemperature            |                                                 | number \| undefined                | Retrieves the temperature value from the configuration.                     |
| getAnswers                |                                                 | YpStructuredAnswer[] \| undefined  | Retrieves the structured answers from the configuration.                    |

## Example

```typescript
import { PsConfigManager } from '@policysynth/agents/base/agentConfigManager.js';

const configuration: PsBaseNodeConfiguration = {
  graphPosX: 0,
  graphPosY: 0,
  name: "Example Configuration"
};

const memory: PsAgentMemoryData = {
  agentId: 1,
  structuredAnswersOverrides: [
    { uniqueId: "exampleId", value: "exampleValue" }
  ]
};

const configManager = new PsConfigManager(configuration, memory);

const value = configManager.getConfig("exampleId", "defaultValue");
console.log(value); // Output: "exampleValue"
```