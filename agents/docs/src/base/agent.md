# PolicySynthAgent

The `PolicySynthAgent` class is an abstract class that extends the `PolicySynthAgentBase` class. It is designed to manage the execution of agents, including handling memory, model management, progress tracking, and configuration management. This class is intended to be subclassed to implement specific agent behaviors.

## Properties

| Name                  | Type                        | Description                                                                 |
|-----------------------|-----------------------------|-----------------------------------------------------------------------------|
| memory                | PsAgentMemoryData           | Stores the agent's memory data.                                             |
| agent                 | PsAgent                     | Represents the agent being managed.                                         |
| modelManager          | PsAiModelManager \| undefined | Manages AI models associated with the agent.                                |
| progressTracker       | PsProgressTracker \| undefined | Tracks the progress of the agent's execution.                               |
| configManager         | PsConfigManager             | Manages the configuration of the agent.                                     |
| redis                 | Redis                       | Redis client for managing agent memory and status.                          |
| skipAiModels          | boolean                     | Flag to skip AI model initialization.                                       |
| skipCheckForProgress  | boolean                     | Flag to skip progress checks.                                               |
| startProgress         | number                      | Initial progress value.                                                     |
| endProgress           | number                      | Final progress value.                                                       |
| pauseCheckInterval    | number                      | Interval for checking pause status (in milliseconds).                       |
| pauseTimeout          | number                      | Timeout for pause status (in milliseconds).                                 |
| memorySaveTimer       | NodeJS.Timeout \| null      | Timer for scheduling memory saves.                                          |
| memorySaveError       | Error \| null               | Stores the last error encountered during memory save.                       |

## Methods

| Name                          | Parameters                                                                 | Return Type                  | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| constructor                   | agent: PsAgent, memory: PsAgentMemoryData \| undefined, startProgress: number, endProgress: number | void                         | Initializes a new instance of the `PolicySynthAgent` class.                 |
| process                       | none                                                                       | Promise<void>                | Main processing logic for the agent. Subclasses should override this method.|
| loadAgentMemoryFromRedis      | none                                                                       | Promise<PsAgentMemoryData>   | Loads the agent's memory from Redis.                                        |
| callModel                     | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function | Promise<any>                 | Calls the AI model with the specified parameters.                           |
| updateRangedProgress          | progress: number \| undefined, message: string                             | Promise<void>                | Updates the progress within a specified range.                              |
| updateProgress                | progress: number \| undefined, message: string                             | Promise<void>                | Updates the progress of the agent.                                          |
| getConfig                     | uniqueId: string, defaultValue: T                                          | T                            | Retrieves a configuration value by unique ID.                               |
| getConfigOld                  | uniqueId: string, defaultValue: T                                          | T                            | Retrieves an old configuration value by unique ID.                          |
| loadStatusFromRedis           | none                                                                       | Promise<PsAgentStatus \| undefined> | Loads the agent's status from Redis.                                        |
| checkProgressForPauseOrStop   | none                                                                       | Promise<void>                | Checks the agent's progress for pause or stop conditions.                   |
| scheduleMemorySave            | none                                                                       | void                         | Schedules a memory save operation.                                          |
| checkLastMemorySaveError      | none                                                                       | void                         | Checks for the last memory save error and throws it if present.             |
| saveMemory                    | none                                                                       | Promise<void>                | Saves the agent's memory to Redis.                                          |
| getTokensFromMessages         | messages: PsModelMessage[]                                                 | Promise<number>              | Calculates the number of tokens from the given messages.                    |
| setCompleted                  | message: string                                                            | Promise<void>                | Sets the agent's status to completed with a message.                        |
| setError                      | errorMessage: string                                                       | Promise<void>                | Sets the agent's status to error with an error message.                     |
| getModelUsageEstimates        | none                                                                       | PsAgentModelUsageEstimate[] \| undefined | Retrieves model usage estimates.                                            |
| getApiUsageEstimates          | none                                                                       | PsAgentApiUsageEstimate[] \| undefined | Retrieves API usage estimates.                                              |
| getMaxTokensOut               | none                                                                       | number \| undefined          | Retrieves the maximum number of tokens that can be output.                  |
| getTemperature                | none                                                                       | number \| undefined          | Retrieves the temperature setting for the model.                            |

## Example

```typescript
import { PolicySynthAgent } from '@policysynth/agents/base/agent.js';

// Example subclass implementation
class CustomAgent extends PolicySynthAgent {
  async process() {
    // Custom processing logic
  }
}

const agent = new CustomAgent(agentData, memoryData, 0, 100);
agent.process();
```

This documentation provides an overview of the `PolicySynthAgent` class, its properties, methods, and an example of how it might be subclassed and used.