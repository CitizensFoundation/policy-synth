# PsConfigManager

The `PsConfigManager` class is a configuration and memory manager for PolicySynth agents. It extends the `PolicySynthAgentBase` and provides methods to access, set, and manage configuration values and memory for an agent node instance. It supports overrides, type-safe retrieval, and intelligent parsing of configuration values.

**File:** `@policysynth/agents/base/agentConfigManager.js`

## Properties

| Name           | Type                        | Description                                                                                 |
|----------------|----------------------------|---------------------------------------------------------------------------------------------|
| configuration  | PsBaseNodeConfiguration     | The configuration object for the agent node instance.                                       |
| memory         | PsAgentMemoryData           | The memory object for the agent, including possible structured answer overrides.            |

## Methods

| Name                    | Parameters                                                                 | Return Type                          | Description                                                                                                    |
|-------------------------|----------------------------------------------------------------------------|--------------------------------------|----------------------------------------------------------------------------------------------------------------|
| constructor             | configuration: PsBaseNodeConfiguration, memory: PsAgentMemoryData          | PsConfigManager                      | Initializes the config manager with configuration and memory.                                                  |
| getValueFromOverride    | uniqueId: string                                                           | string \| number \| boolean \| undefined | Retrieves a value from memory overrides for a given uniqueId, if present.                                      |
| getConfig               | uniqueId: string, defaultValue: T                                          | T                                    | Retrieves a configuration value by uniqueId, with type inference and intelligent parsing.                      |
| getConfigOld            | uniqueId: string, defaultValue: T                                          | T                                    | Legacy method to retrieve a configuration value from the `answers` array, with type inference.                 |
| setConfig               | uniqueId: string, value: T                                                 | void                                 | Sets a configuration value for a given uniqueId.                                                               |
| getAllConfig            | none                                                                       | PsBaseNodeConfiguration              | Returns the entire configuration object.                                                                       |
| getModelUsageEstimates  | none                                                                       | PsAgentModelUsageEstimate[] \| undefined | Returns the model usage estimates from the configuration, if present.                                          |
| getApiUsageEstimates    | none                                                                       | PsAgentApiUsageEstimate[] \| undefined | Returns the API usage estimates from the configuration, if present.                                            |
| getMaxTokensOut         | none                                                                       | number \| undefined                  | Returns the maximum tokens out value from the configuration, if present.                                       |
| getTemperature          | none                                                                       | number \| undefined                  | Returns the temperature value from the configuration, if present.                                              |
| getAnswers              | none                                                                       | YpStructuredAnswer[] \| undefined    | Returns the structured answers from the configuration, if present.                                             |

## Example

```typescript
import { PsConfigManager } from '@policysynth/agents/base/agentConfigManager.js';

// Example configuration and memory objects
const configuration = {
  name: "ExampleAgent",
  maxTokensOut: 2048,
  temperature: 0.7,
  answers: [
    { uniqueId: "apiKey", value: "12345" }
  ]
};

const memory = {
  agentId: 1,
  structuredAnswersOverrides: [
    { uniqueId: "apiKey", value: "override-67890" }
  ]
};

// Instantiate the config manager
const configManager = new PsConfigManager(configuration, memory);

// Retrieve a config value with override
const apiKey = configManager.getConfig<string>("apiKey", "default-key");
console.log(apiKey); // Output: "override-67890"

// Retrieve a config value without override
const maxTokens = configManager.getConfig<number>("maxTokensOut", 1024);
console.log(maxTokens); // Output: 2048

// Set a new config value
configManager.setConfig<number>("temperature", 0.9);

// Get all configuration
const allConfig = configManager.getAllConfig();
console.log(allConfig);

// Get model usage estimates (if present)
const modelUsage = configManager.getModelUsageEstimates();
```

---

**Note:**  
- The `getConfig` method intelligently parses string values to boolean, number, or JSON, and falls back to the default value if not found or empty.
- The `getConfigOld` method is a legacy approach that looks for answers in the `answers` array.
- The class is designed to be used as a utility for agent classes that require dynamic and override-able configuration management.