# PolicySynthAgent

The `PolicySynthAgent` class is an abstract class that extends `PolicySynthAgentBase`. It provides a framework for creating agents that can process tasks, manage configurations, interact with AI models, and track progress. This class is designed to be extended by subclasses that implement specific agent behaviors.

## Properties

| Name                | Type                      | Description                                                                 |
|---------------------|---------------------------|-----------------------------------------------------------------------------|
| memory              | PsAgentMemoryData         | The memory data for the agent.                                              |
| agent               | PsAgent                   | The agent data.                                                             |
| modelManager        | PsAiModelManager \| undefined | The manager for AI models.                                                  |
| progressTracker     | PsProgressTracker         | The tracker for progress updates.                                           |
| configManager       | PsConfigManager           | The manager for configuration settings.                                     |
| redis               | Redis                     | The Redis client instance.                                                  |
| skipAiModels        | boolean                   | Flag to skip AI model initialization. Default is `false`.                   |
| startProgress       | number                    | The starting progress value. Default is `0`.                                |
| endProgress         | number                    | The ending progress value. Default is `100`.                                |
| maxModelTokensOut   | number                    | The maximum number of tokens for model output. Default is `4096`.           |
| modelTemperature    | number                    | The temperature setting for the model. Default is `0.7`.                    |

## Constructor

### `constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined = undefined, startProgress: number, endProgress: number)`

Initializes a new instance of the `PolicySynthAgent` class.

#### Parameters

- `agent` (PsAgent): The agent data.
- `memory` (PsAgentMemoryData | undefined): The memory data for the agent. Default is `undefined`.
- `startProgress` (number): The starting progress value.
- `endProgress` (number): The ending progress value.

## Methods

### `async process()`

Main processing logic for the agent. Subclasses should override this method to implement specific agent behaviors.

### `async loadAgentMemoryFromRedis()`

Loads the agent's memory data from Redis.

### `async callModel(modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks?: Function)`

Calls the AI model with the specified parameters.

#### Parameters

- `modelType` (PsAiModelType): The type of the AI model.
- `modelSize` (PsAiModelSize): The size of the AI model.
- `messages` (PsModelMessage[]): The messages to be processed by the model.
- `parseJson` (boolean): Flag to parse JSON response. Default is `true`.
- `limitedRetries` (boolean): Flag to limit retries. Default is `false`.
- `tokenOutEstimate` (number): Estimated number of tokens for output. Default is `120`.
- `streamingCallbacks` (Function | undefined): Optional streaming callbacks.

### `async updateRangedProgress(progress: number | undefined, message: string)`

Updates the ranged progress with the specified value and message.

#### Parameters

- `progress` (number | undefined): The progress value.
- `message` (string): The progress message.

### `async updateProgress(progress: number | undefined, message: string)`

Updates the progress with the specified value and message.

#### Parameters

- `progress` (number | undefined): The progress value.
- `message` (string): The progress message.

### `getConfig<T>(uniqueId: string, defaultValue: T): T`

Gets the configuration value for the specified unique ID.

#### Parameters

- `uniqueId` (string): The unique ID of the configuration.
- `defaultValue` (T): The default value if the configuration is not found.

#### Returns

- `T`: The configuration value.

### `getConfigOld<T>(uniqueId: string, defaultValue: T): T`

Gets the old configuration value for the specified unique ID.

#### Parameters

- `uniqueId` (string): The unique ID of the configuration.
- `defaultValue` (T): The default value if the configuration is not found.

#### Returns

- `T`: The old configuration value.

### `async saveMemory()`

Saves the agent's memory data to Redis.

### `async getTokensFromMessages(messages: PsModelMessage[]): Promise<number>`

Gets the number of tokens from the specified messages.

#### Parameters

- `messages` (PsModelMessage[]): The messages to calculate tokens from.

#### Returns

- `Promise<number>`: The number of tokens.

### `formatNumber(number: number, fractions = 0)`

Formats the specified number with the given number of fractions.

#### Parameters

- `number` (number): The number to format.
- `fractions` (number): The number of fractions. Default is `0`.

#### Returns

- `string`: The formatted number.

### `async setCompleted(message: string)`

Sets the progress as completed with the specified message.

#### Parameters

- `message` (string): The completion message.

### `async setError(errorMessage: string)`

Sets the progress as error with the specified error message.

#### Parameters

- `errorMessage` (string): The error message.

### `getModelUsageEstimates(): PsAgentModelUsageEstimate[] | undefined`

Gets the model usage estimates.

#### Returns

- `PsAgentModelUsageEstimate[] | undefined`: The model usage estimates.

### `getApiUsageEstimates(): PsAgentApiUsageEstimate[] | undefined`

Gets the API usage estimates.

#### Returns

- `PsAgentApiUsageEstimate[] | undefined`: The API usage estimates.

### `getMaxTokensOut(): number | undefined`

Gets the maximum number of tokens for output.

#### Returns

- `number | undefined`: The maximum number of tokens.

### `getTemperature(): number | undefined`

Gets the temperature setting for the model.

#### Returns

- `number | undefined`: The temperature setting.

## Example

```typescript
import { PolicySynthAgent } from '@policysynth/agents/base/agent.js';
import { PsAgent } from '../dbModels/agent.js';
import { PsAgentMemoryData } from '../types.js';

const agentData: PsAgent = { /* agent data */ };
const memoryData: PsAgentMemoryData = { /* memory data */ };

class CustomAgent extends PolicySynthAgent {
  async process() {
    // Custom processing logic
  }
}

const customAgent = new CustomAgent(agentData, memoryData, 0, 100);
customAgent.process();
```

This documentation provides a detailed overview of the `PolicySynthAgent` class, its properties, methods, and an example of how to use it. Subclasses can extend this class to implement specific agent behaviors.