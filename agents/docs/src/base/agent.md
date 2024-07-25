# PolicySynthAgent

The `PolicySynthAgent` class is an abstract class that extends `PolicySynthAgentBase`. It provides a framework for creating agents that can process tasks, manage memory, interact with AI models, and track progress. This class is designed to be extended by subclasses that implement specific agent behaviors.

## Properties

| Name                  | Type                        | Description                                                                 |
|-----------------------|-----------------------------|-----------------------------------------------------------------------------|
| memory                | PsAgentMemoryData           | The memory data for the agent.                                              |
| agent                 | PsAgent                     | The agent data model.                                                       |
| modelManager          | PsAiModelManager \| undefined | The manager for AI models used by the agent.                                |
| progressTracker       | PsProgressTracker \| undefined | The tracker for agent's progress.                                           |
| configManager         | PsConfigManager             | The manager for agent's configuration.                                      |
| redis                 | Redis                       | The Redis client instance for managing memory and status.                   |
| skipAiModels          | boolean                     | Flag to skip AI model initialization.                                       |
| skipCheckForProgress  | boolean                     | Flag to skip progress check.                                                |
| startProgress         | number                      | The starting progress percentage.                                           |
| endProgress           | number                      | The ending progress percentage.                                             |
| maxModelTokensOut     | number                      | The maximum number of tokens for model output.                              |
| modelTemperature      | number                      | The temperature setting for the model.                                      |
| pauseCheckInterval    | number                      | The interval for checking pause status (in milliseconds).                   |
| pauseTimeout          | number                      | The timeout duration for pause status (in milliseconds).                    |
| memorySaveTimer       | NodeJS.Timeout \| null      | Timer for scheduling memory save operations.                                |
| memorySaveError       | Error \| null               | Error encountered during the last memory save operation.                    |

## Methods

| Name                        | Parameters                                                                 | Return Type                        | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| constructor                 | agent: PsAgent, memory: PsAgentMemoryData \| undefined, startProgress: number, endProgress: number | void                               | Initializes a new instance of the `PolicySynthAgent` class.                 |
| process                     | none                                                                       | Promise<void>                      | Main processing logic to be implemented by subclasses.                      |
| loadAgentMemoryFromRedis    | none                                                                       | Promise<PsAgentMemoryData>         | Loads the agent's memory from Redis.                                        |
| callModel                   | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function | Promise<any>                        | Calls the AI model with the specified parameters.                           |
| updateRangedProgress        | progress: number \| undefined, message: string                             | Promise<void>                      | Updates the ranged progress of the agent.                                   |
| updateProgress              | progress: number \| undefined, message: string                             | Promise<void>                      | Updates the progress of the agent.                                          |
| getConfig                   | uniqueId: string, defaultValue: T                                          | T                                  | Retrieves a configuration value.                                            |
| getConfigOld                | uniqueId: string, defaultValue: T                                          | T                                  | Retrieves an old configuration value.                                       |
| loadStatusFromRedis         | none                                                                       | Promise<PsAgentStatus \| undefined> | Loads the agent's status from Redis.                                        |
| checkProgressForPauseOrStop | none                                                                       | Promise<void>                      | Checks the progress for pause or stop status.                               |
| scheduleMemorySave          | none                                                                       | void                               | Schedules a memory save operation.                                          |
| checkLastMemorySaveError    | none                                                                       | void                               | Checks for errors during the last memory save operation.                    |
| saveMemory                  | none                                                                       | Promise<void>                      | Saves the agent's memory to Redis.                                          |
| getTokensFromMessages       | messages: PsModelMessage[]                                                 | Promise<number>                    | Gets the token count from the specified messages.                           |
| setCompleted                | message: string                                                            | Promise<void>                      | Sets the agent's status to completed.                                       |
| setError                    | errorMessage: string                                                       | Promise<void>                      | Sets the agent's status to error.                                           |
| getModelUsageEstimates      | none                                                                       | PsAgentModelUsageEstimate[] \| undefined | Gets the model usage estimates.                                             |
| getApiUsageEstimates        | none                                                                       | PsAgentApiUsageEstimate[] \| undefined | Gets the API usage estimates.                                               |
| getMaxTokensOut             | none                                                                       | number \| undefined                | Gets the maximum number of tokens for model output.                         |
| getTemperature              | none                                                                       | number \| undefined                | Gets the temperature setting for the model.                                 |

## Example

```typescript
import { PolicySynthAgent } from '@policysynth/agents/base/agent.js';
import { PsAgent } from '../dbModels/agent.js';
import { PsAgentMemoryData } from '../types.js';

class CustomAgent extends PolicySynthAgent {
  constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number) {
    super(agent, memory, startProgress, endProgress);
  }

  async process() {
    // Custom processing logic
  }
}

const agent = new PsAgent(/* agent data */);
const memory: PsAgentMemoryData = { /* memory data */ };
const customAgent = new CustomAgent(agent, memory, 0, 100);

customAgent.process();
```

This example demonstrates how to extend the `PolicySynthAgent` class to create a custom agent with specific processing logic. The `CustomAgent` class overrides the `process` method to implement its own behavior.