# PolicySynthAgent

An abstract base class for PolicySynth agents, providing core logic for agent memory management, AI model invocation, progress tracking, configuration management, and Redis-based state persistence. All custom PolicySynth agents should extend this class to inherit these capabilities.

## Properties

| Name                  | Type                                 | Description                                                                                 |
|-----------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| memory                | PsAgentMemoryData                    | The agent's working memory, persisted in Redis.                                             |
| agent                 | PsAgent                              | The agent instance, including configuration and model info.                                 |
| modelManager          | PsAiModelManager \| undefined        | Manages AI model selection and invocation.                                                  |
| progressTracker       | PsProgressTracker \| undefined       | Tracks and updates agent progress and status.                                               |
| configManager         | PsConfigManager                      | Handles agent configuration and usage estimates.                                            |
| redis                 | Redis                                | Redis client for memory and status persistence.                                             |
| skipAiModels          | boolean                              | If true, disables AI model usage for this agent.                                            |
| skipCheckForProgress  | boolean                              | If true, disables progress check for pause/stop.                                            |
| startProgress         | number                               | The starting progress value for the agent.                                                  |
| endProgress           | number                               | The ending progress value for the agent.                                                    |
| pauseCheckInterval    | number                               | Interval (ms) to check for pause state (default: 48 hours).                                 |
| pauseTimeout          | number                               | Timeout (ms) for pause state (default: 1000 ms).                                            |
| memorySaveTimer       | NodeJS.Timeout \| null               | Timer for scheduled memory save.                                                            |
| memorySaveError       | Error \| null                        | Stores the last error encountered during memory save.                                       |

### Protected Getters

| Name                | Type                | Description                                              |
|---------------------|---------------------|----------------------------------------------------------|
| maxModelTokensOut   | number              | Maximum output tokens for the AI model (default: 16384). |
| modelTemperature    | number              | Temperature for model sampling (default: 0.7).           |
| reasoningEffort     | 'low' \| 'medium' \| 'high' | Reasoning effort for the model (default: 'medium').      |
| maxThinkingTokens   | number              | Maximum tokens for "thinking" (default: 0).              |

## Methods

| Name                        | Parameters                                                                                                    | Return Type                        | Description                                                                                                 |
|-----------------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------|
| constructor                 | agent: PsAgent, memory?: PsAgentMemoryData, startProgress: number, endProgress: number                        | PolicySynthAgent                   | Initializes the agent, memory, model manager, progress tracker, and config manager.                         |
| process                     | none                                                                                                          | Promise<void>                      | Main processing logic (to be overridden by subclasses).                                                     |
| loadAgentMemoryFromRedis    | none                                                                                                          | Promise<PsAgentMemoryData>         | Loads agent memory from Redis and sets `this.memory`.                                                       |
| callModel                   | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options?: PsCallModelOptions  | Promise<any>                       | Calls the AI model via the model manager.                                                                   |
| updateRangedProgress        | progress: number \| undefined, message: string                                                                | Promise<void>                      | Updates progress with a ranged value and message.                                                           |
| updateProgress              | progress: number \| undefined, message: string                                                                | Promise<void>                      | Updates progress with a value and message.                                                                  |
| getConfig                   | uniqueId: string, defaultValue: T                                                                             | T                                  | Gets a config value by uniqueId, with a default fallback.                                                   |
| getConfigOld                | uniqueId: string, defaultValue: T                                                                             | T                                  | Gets a config value using the old method.                                                                   |
| loadStatusFromRedis         | none                                                                                                          | Promise<PsAgentStatus \| undefined>| Loads agent status from Redis.                                                                              |
| checkProgressForPauseOrStop | none                                                                                                          | Promise<void>                      | Checks agent status for pause/stop and throws if stopped or timed out.                                      |
| scheduleMemorySave          | none                                                                                                          | Promise<void>                      | Schedules a memory save operation with a delay.                                                             |
| checkLastMemorySaveError    | none                                                                                                          | void                               | Throws the last memory save error if one occurred.                                                          |
| saveMemory                  | none                                                                                                          | Promise<void>                      | Saves the agent's memory to Redis.                                                                          |
| getTokensFromMessages       | messages: PsModelMessage[]                                                                                    | Promise<number>                    | Returns the token count for a set of messages.                                                              |
| setCompleted                | message: string                                                                                               | Promise<void>                      | Sets the agent's progress as completed with a message.                                                      |
| setError                    | errorMessage: string                                                                                          | Promise<void>                      | Sets the agent's progress as errored with a message.                                                        |
| getModelUsageEstimates      | none                                                                                                          | PsAgentModelUsageEstimate[] \| undefined | Gets model usage estimates from the config manager.                                                    |
| getApiUsageEstimates        | none                                                                                                          | PsAgentApiUsageEstimate[] \| undefined | Gets API usage estimates from the config manager.                                                      |
| getMaxTokensOut             | none                                                                                                          | number \| undefined                | Gets the max tokens out from the config manager.                                                            |
| getTemperature              | none                                                                                                          | number \| undefined                | Gets the temperature from the config manager.                                                               |

## Example

```typescript
import { PolicySynthAgent } from '@policysynth/agents/base/agent.js';
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';

class MyCustomAgent extends PolicySynthAgent {
  async process() {
    // Custom agent logic here
    await this.updateProgress(10, "Starting custom agent process");
    // ... do work ...
    await this.setCompleted("Agent process completed successfully");
  }
}

// Usage
const agentInstance = new PsAgent(/* ...agent data... */);
const myAgent = new MyCustomAgent(agentInstance, undefined, 0, 100);
await myAgent.process();
```

---

## AgentExecutionStoppedError

A custom error class thrown when agent execution is stopped or paused for too long.

### Example

```typescript
import { AgentExecutionStoppedError } from '@policysynth/agents/base/agent.js';

try {
  await myAgent.checkProgressForPauseOrStop();
} catch (e) {
  if (e instanceof AgentExecutionStoppedError) {
    // Handle agent stop
  }
}
```

---

**Note:**  
- This class is abstract and should be extended for concrete agent implementations.
- It provides robust memory and status management using Redis, and integrates with PolicySynth's AI model and configuration managers.
- Subclasses should override the `process()` method to implement agent-specific logic.