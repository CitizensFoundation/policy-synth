# PolicySynthAgent

The `PolicySynthAgent` is an abstract base class for PolicySynth agents, providing core logic for agent memory management, AI model interaction, progress tracking, configuration management, and Redis-based state persistence. It is designed to be extended by specific agent implementations.

## Properties

| Name                  | Type                              | Description                                                                                   |
|-----------------------|-----------------------------------|-----------------------------------------------------------------------------------------------|
| memory                | PsAgentMemoryData                 | The agent's working memory, persisted in Redis.                                               |
| agent                 | PsAgent                           | The agent instance, including configuration and model info.                                   |
| modelManager          | PsAiModelManager \| undefined     | Manages AI model selection and calls for the agent.                                           |
| progressTracker       | PsProgressTracker \| undefined    | Tracks and updates the agent's progress and status.                                           |
| configManager         | PsConfigManager                   | Handles agent configuration and access to config values.                                      |
| redis                 | Redis                             | Redis client instance for memory and status persistence.                                      |
| skipAiModels          | boolean                           | If true, disables AI model usage for this agent.                                              |
| skipCheckForProgress  | boolean                           | If true, disables progress check for pause/stop.                                              |
| startProgress         | number                            | The starting progress value for the agent.                                                    |
| endProgress           | number                            | The ending progress value for the agent.                                                      |
| pauseCheckInterval    | number                            | Interval (ms) to check for pause state (default: 48 hours).                                   |
| pauseTimeout          | number                            | Timeout (ms) for pause state (default: 1000 ms).                                              |
| memorySaveTimer       | NodeJS.Timeout \| null            | Timer for scheduled memory save.                                                              |
| memorySaveError       | Error \| null                     | Stores the last error encountered during memory save.                                         |

### Protected Getters

| Name                | Type                | Description                                               |
|---------------------|---------------------|-----------------------------------------------------------|
| maxModelTokensOut   | number              | Maximum output tokens for the model (default: 16384).     |
| modelTemperature    | number              | Model temperature (default: 0.7).                         |
| reasoningEffort     | 'low'\|'medium'\|'high' | Reasoning effort for the model (default: 'medium').   |
| maxThinkingTokens   | number              | Maximum thinking tokens (default: 0).                     |

## Methods

| Name                        | Parameters                                                                                                    | Return Type                        | Description                                                                                                 |
|-----------------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------|
| constructor                 | agent: PsAgent, memory?: PsAgentMemoryData, startProgress: number, endProgress: number                        | PolicySynthAgent                   | Initializes the agent, memory, model manager, progress tracker, and config manager.                         |
| process                     | none                                                                                                          | Promise\<void\>                    | Main processing logic (to be overridden by subclasses).                                                     |
| loadAgentMemoryFromRedis    | none                                                                                                          | Promise\<PsAgentMemoryData\>        | Loads agent memory from Redis and sets `this.memory`.                                                       |
| callModel                   | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options?: PsCallModelOptions  | Promise\<any\>                     | Calls the AI model via the model manager.                                                                   |
| updateRangedProgress        | progress: number \| undefined, message: string                                                                | Promise\<void\>                    | Updates progress within a range using the progress tracker.                                                 |
| updateProgress              | progress: number \| undefined, message: string                                                                | Promise\<void\>                    | Updates progress using the progress tracker.                                                                |
| getConfig                   | uniqueId: string, defaultValue: T                                                                             | T                                  | Gets a config value by uniqueId, with a default fallback.                                                   |
| getConfigOld                | uniqueId: string, defaultValue: T                                                                             | T                                  | Gets a config value using the old method.                                                                   |
| loadStatusFromRedis         | none                                                                                                          | Promise\<PsAgentStatus \| undefined\> | Loads the agent's status from Redis.                                                                        |
| checkProgressForPauseOrStop | none                                                                                                          | Promise\<void\>                    | Checks if the agent should pause or stop, and throws if so.                                                 |
| scheduleMemorySave          | none                                                                                                          | Promise\<void\>                    | Schedules a memory save operation with a delay.                                                             |
| checkLastMemorySaveError    | none                                                                                                          | void                               | Throws the last memory save error if one occurred.                                                          |
| saveMemory                  | none                                                                                                          | Promise\<void\>                    | Saves the agent's memory to Redis and checks for pause/stop.                                                |
| getTokensFromMessages       | messages: PsModelMessage[]                                                                                    | Promise\<number\>                  | Returns the token count for a set of messages using the model manager.                                      |
| setCompleted                | message: string                                                                                               | Promise\<void\>                    | Sets the agent's progress to completed with a message.                                                      |
| setError                    | errorMessage: string                                                                                          | Promise\<void\>                    | Sets the agent's progress to error with a message.                                                          |
| getModelUsageEstimates      | none                                                                                                          | PsAgentModelUsageEstimate[] \| undefined | Gets model usage estimates from the config manager.                                                    |
| getApiUsageEstimates        | none                                                                                                          | PsAgentApiUsageEstimate[] \| undefined | Gets API usage estimates from the config manager.                                                      |
| getMaxTokensOut             | none                                                                                                          | number \| undefined                | Gets the max tokens out from the config manager.                                                            |
| getTemperature              | none                                                                                                          | number \| undefined                | Gets the temperature from the config manager.                                                               |

## Error Classes

### AgentExecutionStoppedError

Custom error thrown when agent execution is stopped or paused for too long.

| Name    | Type   | Description                        |
|---------|--------|------------------------------------|
| message | string | Error message.                     |

## Example

```typescript
import { PolicySynthAgent, AgentExecutionStoppedError } from '@policysynth/agents/base/agent.js';
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';

// Example subclass implementation
class MyCustomAgent extends PolicySynthAgent {
  async process() {
    // Custom agent logic here
    await this.updateProgress(10, "Starting custom agent process");
    // ... do work ...
    await this.setCompleted("Agent completed successfully");
  }
}

// Usage
const agentInstance = new PsAgent(/* ...agent data... */);
const myAgent = new MyCustomAgent(agentInstance, undefined, 0, 100);

myAgent.process().catch(err => {
  if (err instanceof AgentExecutionStoppedError) {
    console.error("Agent was stopped:", err.message);
  } else {
    console.error("Agent error:", err);
  }
});
```

---

**File:** `@policysynth/agents/base/agent.js`  
This class is intended to be extended for custom PolicySynth agent implementations, providing robust memory, progress, and AI model management out of the box.