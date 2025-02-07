# PolicySynthAgent

The `PolicySynthAgent` class is an abstract class that extends the `PolicySynthAgentBase` class. It is designed to manage the execution of agents, including handling memory, model management, progress tracking, and configuration management. This class provides a framework for implementing specific agent behaviors by extending it and overriding the `process` method.

## Properties

| Name                  | Type                      | Description                                                                 |
|-----------------------|---------------------------|-----------------------------------------------------------------------------|
| memory                | PsAgentMemoryData         | Stores the memory data for the agent.                                       |
| agent                 | PsAgent                   | Represents the agent being managed.                                         |
| modelManager          | PsAiModelManager \| undefined | Manages AI models associated with the agent.                                |
| progressTracker       | PsProgressTracker \| undefined | Tracks the progress of the agent's execution.                               |
| configManager         | PsConfigManager           | Manages the configuration of the agent.                                     |
| redis                 | Redis                     | Redis client for managing agent memory and status.                          |
| skipAiModels          | boolean                   | Flag to skip AI model initialization.                                       |
| skipCheckForProgress  | boolean                   | Flag to skip progress checks.                                               |
| startProgress         | number                    | Initial progress value.                                                     |
| endProgress           | number                    | Final progress value.                                                       |
| pauseCheckInterval    | number                    | Interval for checking pause status (default: 48 hours).                     |
| pauseTimeout          | number                    | Timeout for pause status (default: 1000 ms).                                |
| memorySaveTimer       | NodeJS.Timeout \| null    | Timer for scheduling memory saves.                                          |
| memorySaveError       | Error \| null             | Stores the last memory save error.                                          |

## Methods

| Name                          | Parameters                                                                 | Return Type                  | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| constructor                   | agent: PsAgent, memory: PsAgentMemoryData \| undefined, startProgress: number, endProgress: number | void                         | Initializes a new instance of the `PolicySynthAgent` class.                 |
| process                       | -                                                                          | Promise<void>                | Main processing logic for the agent. Subclasses should override this method.|
| loadAgentMemoryFromRedis      | -                                                                          | Promise<PsAgentMemoryData>   | Loads agent memory from Redis.                                              |
| callModel                     | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function | Promise<any>                 | Calls the AI model with the specified parameters.                           |
| updateRangedProgress          | progress: number \| undefined, message: string                             | Promise<void>                | Updates the ranged progress of the agent.                                   |
| updateProgress                | progress: number \| undefined, message: string                             | Promise<void>                | Updates the progress of the agent.                                          |
| getConfig                     | uniqueId: string, defaultValue: T                                          | T                            | Retrieves a configuration value by unique ID.                               |
| getConfigOld                  | uniqueId: string, defaultValue: T                                          | T                            | Retrieves an old configuration value by unique ID.                          |
| loadStatusFromRedis           | -                                                                          | Promise<PsAgentStatus \| undefined> | Loads the agent's status from Redis.                                        |
| checkProgressForPauseOrStop   | -                                                                          | Promise<void>                | Checks the progress for pause or stop conditions.                           |
| scheduleMemorySave            | -                                                                          | Promise<void>                | Schedules a memory save operation.                                          |
| checkLastMemorySaveError      | -                                                                          | void                         | Checks for the last memory save error and throws it if present.             |
| saveMemory                    | -                                                                          | Promise<void>                | Saves the agent's memory to Redis.                                          |
| getTokensFromMessages         | messages: PsModelMessage[]                                                 | Promise<number>              | Calculates the number of tokens from the given messages.                    |
| setCompleted                  | message: string                                                            | Promise<void>                | Sets the agent's status to completed with a message.                        |
| setError                      | errorMessage: string                                                       | Promise<void>                | Sets the agent's status to error with an error message.                     |
| getModelUsageEstimates        | -                                                                          | PsAgentModelUsageEstimate[] \| undefined | Retrieves model usage estimates.                                            |
| getApiUsageEstimates          | -                                                                          | PsAgentApiUsageEstimate[] \| undefined | Retrieves API usage estimates.                                              |
| getMaxTokensOut               | -                                                                          | number \| undefined          | Retrieves the maximum tokens out configuration.                             |
| getTemperature                | -                                                                          | number \| undefined          | Retrieves the temperature configuration.                                    |

## Example

```typescript
import { PolicySynthAgent } from '@policysynth/agents/base/agent.js';

// Example usage of PolicySynthAgent
class CustomAgent extends PolicySynthAgent {
  async process() {
    // Implement custom processing logic here
  }
}

const agent = new CustomAgent(agentData, memoryData, 0, 100);
agent.process();
```

This documentation provides an overview of the `PolicySynthAgent` class, its properties, methods, and an example of how to extend and use it. The class is designed to be extended for specific agent implementations, with the `process` method being the primary entry point for custom logic.