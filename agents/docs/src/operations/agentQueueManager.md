# AgentQueueManager

The `AgentQueueManager` class is responsible for managing agent job queues using [BullMQ](https://docs.bullmq.io/) and Redis. It provides methods to control agent processing, manage agent status, and interact with job queues for asynchronous agent operations in the PolicySynth system.

**File:** `@policysynth/agents/operations/agentQueueManager.js`

## Properties

| Name         | Type                | Description                                                                 |
|--------------|---------------------|-----------------------------------------------------------------------------|
| redisClient  | `Redis`             | The ioredis client instance used for queue and status management.           |
| queues       | `Map<string, Queue>`| A map of queue names to BullMQ Queue instances, one per agent class queue.  |

## Constructor

### `constructor()`

Initializes the `AgentQueueManager`, sets up the Redis connection, and prepares the internal queue map.

---

## Methods

| Name                        | Parameters                                                                                                                                         | Return Type                | Description                                                                                                    |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|----------------------------------------------------------------------------------------------------------------|
| `initializeRedis`           | none                                                                                                                                               | `void`                     | Initializes the Redis client using environment variables and sets up event listeners for connection events.     |
| `getQueue`                  | `queueName: string`                                                                                                                                | `Queue`                    | Retrieves or creates a BullMQ queue for the given name, sets up event listeners for debugging and monitoring.  |
| `controlAgent`              | `agentId: number, action: string`                                                                                                                  | `Promise<string>`          | Adds a control job (e.g., start, pause, stop) for the specified agent to its queue.                            |
| `startAgentProcessing`      | `agentId: number`                                                                                                                                  | `Promise<boolean>`         | Adds a "start-processing" control message to the agent's queue and updates its status to "running".            |
| `pauseAgentProcessing`      | `agentId: number`                                                                                                                                  | `Promise<boolean>`         | Adds a "pause-processing" control message to the agent's queue and updates its status to "paused".             |
| `getAgentStatus`            | `agentId: number`                                                                                                                                  | `Promise<PsAgentStatus\|null>` | Retrieves the current status of the agent from Redis, or `null` if not found.                                  |
| `clearAgentStatusMessages`  | `agentId: number`                                                                                                                                  | `Promise<void>`            | Clears the status messages array for the agent in Redis, updating the last updated timestamp.                  |
| `updateAgentStatus`         | `agentId: number, state: PsAgentStatus["state"], progress?: number, message?: string, details?: Record<string, any>`                                | `Promise<boolean>`         | Updates the agent's status in Redis, including state, progress, messages, and details.                         |

---

## Detailed Method Descriptions

### `initializeRedis()`

- Determines the Redis URL from environment variables.
- Handles special cases for Redis URLs (e.g., Heroku format).
- Configures TLS if using `rediss://`.
- Sets up event listeners for connection, error, reconnecting, and ready events.

### `getQueue(queueName: string): Queue`

- Checks if a queue with the given name exists in the internal map.
- If not, creates a new BullMQ `Queue` and a `QueueEvents` instance for global event monitoring.
- Sets up event listeners for job lifecycle events (waiting, active, completed, failed, progress, removed, drained, error).
- Returns the queue instance.

### `controlAgent(agentId: number, action: string): Promise<string>`

- Looks up the agent and its class by ID.
- Determines the queue name from the agent class configuration.
- Adds a job to the queue with the specified action (e.g., "startAgent", "pauseAgent").
- Returns a message indicating the action was queued.

### `startAgentProcessing(agentId: number): Promise<boolean>`

- Looks up the agent and its class.
- Adds a "start-processing" control message to the agent's queue.
- Updates the agent's status to "running" in Redis.
- Returns `true` if successful, `false` otherwise.

### `pauseAgentProcessing(agentId: number): Promise<boolean>`

- Looks up the agent and its class.
- Adds a "pause-processing" control message to the agent's queue.
- Updates the agent's status to "paused" in Redis.
- Returns `true` if successful, `false` otherwise.

### `getAgentStatus(agentId: number): Promise<PsAgentStatus | null>`

- Looks up the agent and its class.
- Retrieves the agent's status from Redis using the agent's `redisStatusKey`.
- Parses and returns the status as a `PsAgentStatus` object, or `null` if not found.

### `clearAgentStatusMessages(agentId: number): Promise<void>`

- Looks up the agent and its class.
- Retrieves the agent's status from Redis.
- Clears the `messages` array and updates the `lastUpdated` timestamp.
- Saves the updated status back to Redis.

### `updateAgentStatus(agentId: number, state: PsAgentStatus["state"], progress?: number, message?: string, details?: Record<string, any>): Promise<boolean>`

- Looks up the agent and its class.
- Retrieves the agent's status from Redis.
- Updates the `state`, `progress`, `messages`, `details`, and `lastUpdated` fields as provided.
- Saves the updated status back to Redis.
- Returns `true` if successful, `false` otherwise.

---

## Example

```typescript
import { AgentQueueManager } from '@policysynth/agents/operations/agentQueueManager.js';

// Instantiate the manager
const agentQueueManager = new AgentQueueManager();

// Start processing for agent with ID 42
await agentQueueManager.startAgentProcessing(42);

// Pause processing for agent with ID 42
await agentQueueManager.pauseAgentProcessing(42);

// Get the current status of agent 42
const status = await agentQueueManager.getAgentStatus(42);
console.log(status);

// Clear status messages for agent 42
await agentQueueManager.clearAgentStatusMessages(42);

// Update agent status manually
await agentQueueManager.updateAgentStatus(42, "paused", 50, "Paused by admin", { reason: "maintenance" });
```

---

## Related Types

- **PsAgentStatus**  
  ```typescript
  interface PsAgentStatus {
    state: "running" | "paused" | "stopped" | "error" | "completed";
    progress: number;
    messages: string[];
    lastUpdated: number;
    details?: Record<string, any>;
  }
  ```

- **PsAgent** and **PsAgentClass**  
  Sequelize models representing agents and their classes, including configuration such as `queueName`.

---

## Notes

- This class is intended for internal use in the PolicySynth agent orchestration system.
- It assumes that agent status is tracked in Redis using a key available as `agent.redisStatusKey`.
- All queue and status operations are asynchronous and should be awaited.
- The class extends `PolicySynthAgentBase`, which provides logging and possibly other shared functionality.
