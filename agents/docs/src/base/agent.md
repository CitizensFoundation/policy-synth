# PolicySynthAgent

The `PolicySynthAgent` is an abstract base class for PolicySynth agents, providing core logic for agent execution, memory management, progress tracking, AI model management, and configuration. It is designed to be extended by specific agent implementations.

## Properties

| Name                  | Type                                 | Description                                                                                 |
|-----------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| memory                | PsAgentMemoryData                    | The agent's memory object, persisted in Redis.                                              |
| agent                 | PsAgent                              | The agent instance, including configuration and model information.                          |
| modelManager          | PsAiModelManager \| undefined        | Manages available AI models for the agent.                                                  |
| progressTracker       | PsProgressTracker \| undefined       | Tracks and updates the agent's progress.                                                    |
| configManager         | PsConfigManager                      | Manages agent configuration and provides access to config values.                           |
| redis                 | Redis                                | Redis client instance for memory and status persistence.                                    |
| skipAiModels          | boolean                              | If true, skips AI model initialization.                                                     |
| skipCheckForProgress  | boolean                              | If true, disables progress check for pause/stop.                                            |
| startProgress         | number                               | The starting progress value for the agent.                                                  |
| endProgress           | number                               | The ending progress value for the agent.                                                    |
| pauseCheckInterval    | number                               | Interval (ms) to check for pause state (default: 48 hours).                                 |
| pauseTimeout          | number                               | Timeout (ms) for pause state (default: 1000 ms).                                            |
| memorySaveTimer       | NodeJS.Timeout \| null               | Timer for scheduled memory save.                                                            |
| memorySaveError       | Error \| null                        | Stores the last error encountered during memory save.                                       |

### Protected Getters

| Name                  | Type                                 | Description                                                                                 |
|-----------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| maxModelTokensOut     | number                               | Maximum output tokens for the model (default: 16384).                                       |
| modelTemperature      | number                               | Temperature for model sampling (default: 0.7).                                              |
| reasoningEffort       | 'low' \| 'medium' \| 'high'          | Reasoning effort for the model (default: 'medium').                                         |
| maxThinkingTokens     | number                               | Maximum tokens for "thinking" (default: 0).                                                 |

## Methods

| Name                        | Parameters                                                                                                    | Return Type                        | Description                                                                                      |
|-----------------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------|--------------------------------------------------------------------------------------------------|
| constructor                 | agent: PsAgent, memory?: PsAgentMemoryData \| undefined, startProgress: number, endProgress: number           | PolicySynthAgent                   | Initializes the agent, model manager, progress tracker, config manager, and loads memory.         |
| process                     | none                                                                                                          | Promise\<void\>                    | Main processing logic; should be overridden by subclasses.                                        |
| loadAgentMemoryFromRedis    | none                                                                                                          | Promise\<PsAgentMemoryData\>        | Loads agent memory from Redis and sets `this.memory`.                                             |
| callModel                   | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options?: PsCallModelOptions  | Promise\<any\>                     | Calls the AI model via the model manager.                                                         |
| updateRangedProgress        | progress: number \| undefined, message: string                                                                | Promise\<void\>                    | Updates progress within a range using the progress tracker.                                       |
| updateProgress              | progress: number \| undefined, message: string                                                                | Promise\<void\>                    | Updates progress using the progress tracker.                                                      |
| getConfig                   | uniqueId: string, defaultValue: T                                                                             | T                                  | Gets a config value by unique ID, with a default.                                                 |
| getConfigOld                | uniqueId: string, defaultValue: T                                                                             | T                                  | Gets a config value by unique ID using the old method, with a default.                            |
| loadStatusFromRedis         | none                                                                                                          | Promise\<PsAgentStatus \| undefined\> | Loads the agent's status from Redis.                                                              |
| checkProgressForPauseOrStop | none                                                                                                          | Promise\<void\>                    | Checks if the agent should pause or stop, and throws if so.                                       |
| scheduleMemorySave          | none                                                                                                          | Promise\<void\>                    | Schedules a memory save operation.                                                                |
| checkLastMemorySaveError    | none                                                                                                          | void                               | Throws the last memory save error, if any.                                                        |
| saveMemory                  | none                                                                                                          | Promise\<void\>                    | Saves the agent's memory to Redis.                                                                |
| getTokensFromMessages       | messages: PsModelMessage[]                                                                                    | Promise\<number\>                  | Returns the token count for a set of messages.                                                    |
| setCompleted                | message: string                                                                                               | Promise\<void\>                    | Sets the agent's progress as completed.                                                           |
| setError                    | errorMessage: string                                                                                          | Promise\<void\>                    | Sets the agent's progress as errored.                                                             |
| getModelUsageEstimates      | none                                                                                                          | PsAgentModelUsageEstimate[] \| undefined | Gets model usage estimates from the config manager.                                               |
| getApiUsageEstimates        | none                                                                                                          | PsAgentApiUsageEstimate[] \| undefined | Gets API usage estimates from the config manager.                                                 |
| getMaxTokensOut             | none                                                                                                          | number \| undefined                | Gets the max tokens out from the config manager.                                                  |
| getTemperature              | none                                                                                                          | number \| undefined                | Gets the temperature from the config manager.                                                     |

## Example

```typescript
import { PolicySynthAgent } from '@policysynth/agents/base/agent.js';
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';

// Example agent instance and memory
const agent: PsAgent = /* ... */;
const memory = undefined; // or a PsAgentMemoryData object

class MyCustomAgent extends PolicySynthAgent {
  async process() {
    // Custom agent logic here
    await this.updateProgress(10, "Starting custom process");
    // ... do work ...
    await this.setCompleted("Custom agent completed!");
  }
}

const myAgent = new MyCustomAgent(agent, memory, 0, 100);
myAgent.process().catch(console.error);
```

---

## AgentExecutionStoppedError

A custom error class used to indicate that agent execution has been stopped or paused for too long.

### Example

```typescript
import { AgentExecutionStoppedError } from '@policysynth/agents/base/agent.js';

try {
  // ... agent logic ...
  throw new AgentExecutionStoppedError("Stopped by user");
} catch (err) {
  if (err instanceof AgentExecutionStoppedError) {
    // Handle agent stop
  }
}
```
