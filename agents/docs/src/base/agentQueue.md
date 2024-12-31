# PolicySynthAgentQueue

The `PolicySynthAgentQueue` is an abstract class that extends the `PolicySynthAgent` class. It is designed to manage and process agents using a queue system, leveraging Redis for status management and BullMQ for job processing.

## Properties

| Name                      | Type                        | Description                                                                 |
|---------------------------|-----------------------------|-----------------------------------------------------------------------------|
| status                    | `PsAgentStatus`             | Represents the current status of the agent.                                 |
| redisClient               | `Redis`                     | An instance of the Redis client used for managing agent status.             |
| structuredAnswersOverrides| `Array<YpStructuredAnswer>` | Optional structured answers that can override default settings.             |
| skipCheckForProgress      | `boolean`                   | A flag to skip checking for progress, default is `true`.                    |

## Methods

| Name                        | Parameters                                                                 | Return Type         | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------|
| constructor                 | -                                                                          | -                   | Initializes the agent queue and sets up Redis connection.                   |
| initializeRedis             | -                                                                          | `void`              | Initializes the Redis client with appropriate configurations.               |
| loadAgentStatusFromRedis    | -                                                                          | `Promise<PsAgentStatus>` | Loads the agent's status from Redis.                                        |
| saveAgentStatusToRedis      | -                                                                          | `Promise<void>`     | Saves the current agent status to Redis.                                    |
| setupStatusIfNeeded         | -                                                                          | `Promise<void>`     | Sets up the agent status if it is not already initialized.                  |
| processAllAgents            | -                                                                          | `Promise<void>`     | Processes all agents using the defined processors.                          |
| setupAgentQueue             | -                                                                          | `Promise<void>`     | Sets up the worker and queue events for the agent queue.                    |
| startAgent                  | -                                                                          | `Promise<void>`     | Starts the agent processing.                                                |
| stopAgent                   | -                                                                          | `Promise<void>`     | Stops the agent processing.                                                 |
| pauseAgent                  | -                                                                          | `Promise<void>`     | Pauses the agent processing.                                                |
| updateAgentStatus           | `state: "running" | "stopped" | "paused" | "error"`, `message?: string` | `Promise<void>`     | Updates the agent's status and saves it to Redis.                           |

## Abstract Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| processors    | `Array<{ processor: new (agent: PsAgent, memory: any, startProgress: number, endProgress: number) => PolicySynthAgent; weight: number; }>` | Defines the processors to be used for processing agents. |
| agentQueueName| `string` | The name of the agent queue. |

## Abstract Methods

| Name                  | Parameters | Return Type     | Description                             |
|-----------------------|------------|-----------------|-----------------------------------------|
| setupMemoryIfNeeded   | -          | `Promise<void>` | Sets up the memory if needed.           |

## Example

```typescript
import { PolicySynthAgentQueue } from '@policysynth/agents/base/agentQueue.js';

class CustomAgentQueue extends PolicySynthAgentQueue {
  get processors() {
    return [
      {
        processor: CustomProcessor,
        weight: 50,
      },
    ];
  }

  get agentQueueName() {
    return "customAgentQueue";
  }

  async setupMemoryIfNeeded() {
    // Custom memory setup logic
  }
}
```

This class is designed to be extended and customized for specific agent processing needs, providing a robust framework for managing agent queues and processing workflows.