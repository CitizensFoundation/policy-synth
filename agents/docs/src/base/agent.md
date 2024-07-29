# PolicySynthAgent

The `PolicySynthAgent` class is an abstract class that extends `PolicySynthAgentBase`. It provides a framework for creating agents that can process tasks, manage memory, interact with AI models, and track progress. This class is designed to be extended by subclasses that implement specific agent behaviors.

## Properties

| Name                  | Type                        | Description                                                                 |
|-----------------------|-----------------------------|-----------------------------------------------------------------------------|
| memory                | PsAgentMemoryData           | The memory data for the agent.                                              |
| agent                 | PsAgent                     | The agent instance.                                                         |
| modelManager          | PsAiModelManager \| undefined | The manager for AI models used by the agent.                                |
| progressTracker       | PsProgressTracker \| undefined | The tracker for the agent's progress.                                       |
| configManager         | PsConfigManager             | The manager for the agent's configuration.                                  |
| redis                 | Redis                       | The Redis client instance.                                                  |
| skipAiModels          | boolean                     | Flag to skip AI models initialization.                                      |
| skipCheckForProgress  | boolean                     | Flag to skip progress check.                                                |
| startProgress         | number                      | The starting progress value.                                                |
| endProgress           | number                      | The ending progress value.                                                  |
| maxModelTokensOut     | number                      | The maximum number of tokens for model output.                              |
| modelTemperature      | number                      | The temperature setting for the model.                                      |
| pauseCheckInterval    | number                      | The interval for checking pause status (in milliseconds).                   |
| pauseTimeout          | number                      | The timeout for pause status (in milliseconds).                             |
| memorySaveTimer       | NodeJS.Timeout \| null      | The timer for saving memory.                                                |
| memorySaveError       | Error \| null               | The error encountered during memory save.                                   |

## Methods

| Name                        | Parameters                                                                 | Return Type                        | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| constructor                 | agent: PsAgent, memory: PsAgentMemoryData \| undefined, startProgress: number, endProgress: number | void                               | Initializes a new instance of the `PolicySynthAgent` class.                 |
| process                     | none                                                                       | Promise<void>                      | The main processing logic for the agent. Subclasses should override this.   |
| loadAgentMemoryFromRedis    | none                                                                       | Promise<PsAgentMemoryData>         | Loads the agent's memory from Redis.                                        |
| callModel                   | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Function | Promise<any>                       | Calls the AI model with the specified parameters.                           |
| updateRangedProgress        | progress: number \| undefined, message: string                             | Promise<void>                      | Updates the ranged progress of the agent.                                   |
| updateProgress              | progress: number \| undefined, message: string                             | Promise<void>                      | Updates the progress of the agent.                                          |
| getConfig                   | uniqueId: string, defaultValue: T                                          | T                                  | Gets a configuration value by unique ID.                                    |
| getConfigOld                | uniqueId: string, defaultValue: T                                          | T                                  | Gets an old configuration value by unique ID.                               |
| loadStatusFromRedis         | none                                                                       | Promise<PsAgentStatus \| undefined>| Loads the agent's status from Redis.                                        |
| checkProgressForPauseOrStop | none                                                                       | Promise<void>                      | Checks the progress for pause or stop status.                               |
| scheduleMemorySave          | none                                                                       | void                               | Schedules a memory save operation.                                          |
| checkLastMemorySaveError    | none                                                                       | void                               | Checks for the last memory save error and throws it if present.             |
| saveMemory                  | none                                                                       | Promise<void>                      | Saves the agent's memory to Redis.                                          |
| getTokensFromMessages       | messages: PsModelMessage[]                                                 | Promise<number>                    | Gets the number of tokens from the specified messages.                      |
| setCompleted                | message: string                                                            | Promise<void>                      | Sets the agent's status to completed with the specified message.            |
| setError                    | errorMessage: string                                                       | Promise<void>                      | Sets the agent's status to error with the specified error message.          |
| getModelUsageEstimates      | none                                                                       | PsAgentModelUsageEstimate[] \| undefined | Gets the model usage estimates from the configuration manager.              |
| getApiUsageEstimates        | none                                                                       | PsAgentApiUsageEstimate[] \| undefined | Gets the API usage estimates from the configuration manager.                |
| getMaxTokensOut             | none                                                                       | number \| undefined                | Gets the maximum tokens out value from the configuration manager.           |
| getTemperature              | none                                                                       | number \| undefined                | Gets the temperature value from the configuration manager.                  |

## Example

```typescript
import { PolicySynthAgent } from '@policysynth/agents/base/agent.js';
import { PsAgent } from '../dbModels/agent.js';
import { PsAgentMemoryData } from '../types.js';

class CustomAgent extends PolicySynthAgent {
  constructor(agent: PsAgent, memory: PsAgentMemoryData, startProgress: number, endProgress: number) {
    super(agent, memory, startProgress, endProgress);
  }

  async process() {
    // Custom processing logic
  }
}

const agent = new PsAgent(/* initialization parameters */);
const memory: PsAgentMemoryData = { /* memory data */ };
const customAgent = new CustomAgent(agent, memory, 0, 100);

customAgent.process();
```

This example demonstrates how to extend the `PolicySynthAgent` class to create a custom agent with specific processing logic. The `CustomAgent` class overrides the `process` method to implement its own behavior.