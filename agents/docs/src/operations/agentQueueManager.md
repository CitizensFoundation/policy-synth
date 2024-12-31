# AgentQueueManager

The `AgentQueueManager` class is responsible for managing agent queues using Redis and BullMQ. It provides methods to initialize Redis connections, manage queues, and control agent processing.

## Properties

| Name        | Type                | Description                                      |
|-------------|---------------------|--------------------------------------------------|
| redisClient | Redis               | Redis client instance for managing connections.  |
| queues      | Map<string, Queue>  | A map to store and manage queues by their names. |

## Methods

| Name                  | Parameters                                                                 | Return Type          | Description                                                                 |
|-----------------------|----------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor           | -                                                                          | -                    | Initializes the `AgentQueueManager` and sets up Redis connection.           |
| initializeRedis       | -                                                                          | void                 | Initializes the Redis client with the specified connection options.         |
| getQueue              | queueName: string                                                          | Queue                | Retrieves or creates a queue for the specified name.                        |
| controlAgent          | agentId: number, action: string                                            | Promise<string>      | Controls an agent by adding a job to the queue for the specified action.    |
| startAgentProcessing  | agentId: number                                                            | Promise<boolean>     | Starts processing for the specified agent by adding a job to the queue.     |
| pauseAgentProcessing  | agentId: number                                                            | Promise<boolean>     | Pauses processing for the specified agent by adding a job to the queue.     |
| getAgentStatus        | agentId: number                                                            | Promise<PsAgentStatus \| null> | Retrieves the status of the specified agent from Redis.                     |
| updateAgentStatus     | agentId: number, state: PsAgentStatus["state"], progress?: number, message?: string, details?: Record<string, any> | Promise<boolean>     | Updates the status of the specified agent in Redis.                         |

## Example

```typescript
import { AgentQueueManager } from '@policysynth/agents/operations/agentQueueManager.js';

const agentQueueManager = new AgentQueueManager();

// Example usage: Start processing for an agent
agentQueueManager.startAgentProcessing(1).then((result) => {
  console.log("Agent processing started:", result);
});

// Example usage: Pause processing for an agent
agentQueueManager.pauseAgentProcessing(1).then((result) => {
  console.log("Agent processing paused:", result);
});

// Example usage: Get agent status
agentQueueManager.getAgentStatus(1).then((status) => {
  console.log("Agent status:", status);
});
```

This class is designed to manage agent queues efficiently, providing methods to control agent processing and monitor their status using Redis and BullMQ.