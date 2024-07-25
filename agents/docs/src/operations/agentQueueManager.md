# AgentQueueManager

The `AgentQueueManager` class is responsible for managing agent queues using Redis and BullMQ. It provides methods to control agent processing, such as starting, pausing, and updating the status of agents.

## Properties

| Name         | Type                | Description                                      |
|--------------|---------------------|--------------------------------------------------|
| redisClient  | Redis               | The Redis client instance.                       |
| queues       | Map<string, Queue>  | A map to store BullMQ queues by their names.     |

## Constructor

### `constructor()`

Initializes the `AgentQueueManager` instance by setting up Redis and initializing the queues map.

## Methods

### `initializeRedis()`

Initializes the Redis client and sets up error handling.

### `getQueue(queueName: string): Queue`

Retrieves a BullMQ queue by its name. If the queue does not exist, it creates a new one and stores it in the `queues` map.

- **Parameters:**
  - `queueName` (string): The name of the queue to retrieve.
- **Returns:** `Queue`: The BullMQ queue instance.

### `async controlAgent(agentId: number, action: string): Promise<string>`

Controls an agent by adding a control job to the appropriate queue.

- **Parameters:**
  - `agentId` (number): The ID of the agent to control.
  - `action` (string): The action to perform (e.g., "start", "pause").
- **Returns:** `Promise<string>`: A message indicating the action has been queued.

### `async startAgentProcessing(agentId: number): Promise<boolean>`

Starts the processing of an agent by adding a control message to the queue and updating the agent's status.

- **Parameters:**
  - `agentId` (number): The ID of the agent to start processing.
- **Returns:** `Promise<boolean>`: `true` if the agent was successfully started, `false` otherwise.

### `async pauseAgentProcessing(agentId: number): Promise<boolean>`

Pauses the processing of an agent by adding a control message to the queue and updating the agent's status.

- **Parameters:**
  - `agentId` (number): The ID of the agent to pause processing.
- **Returns:** `Promise<boolean>`: `true` if the agent was successfully paused, `false` otherwise.

### `async getAgentStatus(agentId: number): Promise<PsAgentStatus | null>`

Retrieves the status of an agent from Redis.

- **Parameters:**
  - `agentId` (number): The ID of the agent to retrieve the status for.
- **Returns:** `Promise<PsAgentStatus | null>`: The status of the agent, or `null` if not found.

### `async updateAgentStatus(agentId: number, state: PsAgentStatus["state"], progress?: number, message?: string, details?: Record<string, any>): Promise<boolean>`

Updates the status of an agent in Redis.

- **Parameters:**
  - `agentId` (number): The ID of the agent to update the status for.
  - `state` (PsAgentStatus["state"]): The new state of the agent.
  - `progress` (number, optional): The progress of the agent.
  - `message` (string, optional): A message to add to the agent's status.
  - `details` (Record<string, any>, optional): Additional details to add to the agent's status.
- **Returns:** `Promise<boolean>`: `true` if the status was successfully updated, `false` otherwise.

## Example

```typescript
import { AgentQueueManager } from '@policysynth/agents/operations/agentQueueManager.js';

const agentQueueManager = new AgentQueueManager();

// Start an agent
agentQueueManager.startAgentProcessing(1).then((result) => {
  console.log(`Agent started: ${result}`);
});

// Pause an agent
agentQueueManager.pauseAgentProcessing(1).then((result) => {
  console.log(`Agent paused: ${result}`);
});

// Get agent status
agentQueueManager.getAgentStatus(1).then((status) => {
  console.log(`Agent status:`, status);
});

// Update agent status
agentQueueManager.updateAgentStatus(1, 'running', 50, 'Processing', { detail: 'example' }).then((result) => {
  console.log(`Agent status updated: ${result}`);
});
```

This documentation provides a detailed overview of the `AgentQueueManager` class, its properties, methods, and an example of how to use it.