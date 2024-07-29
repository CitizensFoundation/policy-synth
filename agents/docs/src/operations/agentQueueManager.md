# AgentQueueManager

The `AgentQueueManager` class is responsible for managing agent queues using Redis and BullMQ. It handles the initialization of Redis, creation and management of queues, and control of agent processing.

## Properties

| Name        | Type                | Description                                      |
|-------------|---------------------|--------------------------------------------------|
| redisClient | Redis               | The Redis client instance.                       |
| queues      | Map<string, Queue>  | A map of queue names to their corresponding Queue instances. |

## Methods

| Name                  | Parameters                                                                 | Return Type                | Description                                                                                       |
|-----------------------|----------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------|
| constructor           | None                                                                       | void                       | Initializes the `AgentQueueManager` instance and sets up Redis and queues.                        |
| initializeRedis       | None                                                                       | void                       | Initializes the Redis client and sets up event listeners for Redis connection events.             |
| getQueue              | queueName: string                                                          | Queue                      | Retrieves or creates a new queue for the given queue name.                                        |
| controlAgent          | agentId: number, action: string                                            | Promise<string>            | Controls an agent by adding a job to the appropriate queue.                                       |
| startAgentProcessing  | agentId: number                                                            | Promise<boolean>           | Starts processing for the specified agent.                                                        |
| pauseAgentProcessing  | agentId: number                                                            | Promise<boolean>           | Pauses processing for the specified agent.                                                        |
| getAgentStatus        | agentId: number                                                            | Promise<PsAgentStatus \| null> | Retrieves the status of the specified agent.                                                      |
| updateAgentStatus     | agentId: number, state: PsAgentStatus["state"], progress?: number, message?: string, details?: Record<string, any> | Promise<boolean>           | Updates the status of the specified agent.                                                        |

## Example

```typescript
import { AgentQueueManager } from '@policysynth/agents/operations/agentQueueManager.js';

const agentQueueManager = new AgentQueueManager();

// Example usage: Start processing for an agent with ID 1
agentQueueManager.startAgentProcessing(1).then((result) => {
  console.log('Agent processing started:', result);
}).catch((error) => {
  console.error('Error starting agent processing:', error);
});
```

## Detailed Method Descriptions

### constructor

Initializes the `AgentQueueManager` instance and sets up Redis and queues.

### initializeRedis

Initializes the Redis client and sets up event listeners for Redis connection events.

### getQueue

Retrieves or creates a new queue for the given queue name.

**Parameters:**
- `queueName` (string): The name of the queue to retrieve or create.

**Returns:**
- `Queue`: The queue instance for the given queue name.

### controlAgent

Controls an agent by adding a job to the appropriate queue.

**Parameters:**
- `agentId` (number): The ID of the agent to control.
- `action` (string): The action to perform on the agent (e.g., "start", "pause").

**Returns:**
- `Promise<string>`: A promise that resolves to a message indicating the result of the control action.

### startAgentProcessing

Starts processing for the specified agent.

**Parameters:**
- `agentId` (number): The ID of the agent to start processing for.

**Returns:**
- `Promise<boolean>`: A promise that resolves to `true` if the agent processing was started successfully, or `false` otherwise.

### pauseAgentProcessing

Pauses processing for the specified agent.

**Parameters:**
- `agentId` (number): The ID of the agent to pause processing for.

**Returns:**
- `Promise<boolean>`: A promise that resolves to `true` if the agent processing was paused successfully, or `false` otherwise.

### getAgentStatus

Retrieves the status of the specified agent.

**Parameters:**
- `agentId` (number): The ID of the agent to retrieve the status for.

**Returns:**
- `Promise<PsAgentStatus | null>`: A promise that resolves to the status of the agent, or `null` if the agent or status data was not found.

### updateAgentStatus

Updates the status of the specified agent.

**Parameters:**
- `agentId` (number): The ID of the agent to update the status for.
- `state` (PsAgentStatus["state"]): The new state of the agent.
- `progress` (number, optional): The progress of the agent.
- `message` (string, optional): A message to add to the agent's status.
- `details` (Record<string, any>, optional): Additional details to add to the agent's status.

**Returns:**
- `Promise<boolean>`: A promise that resolves to `true` if the agent status was updated successfully, or `false` otherwise.
```