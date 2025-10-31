# PolicySynthAgentQueue

An abstract base class for managing and processing PolicySynth agents in a distributed queue system using Redis and BullMQ. This class handles agent lifecycle, memory, status, and job processing, and is designed to be extended for specific agent queue implementations.

## Properties

| Name                    | Type                                         | Description                                                                                 |
|-------------------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| agentsMap               | Map<number, PsAgent>                         | Maps agent IDs to loaded `PsAgent` instances.                                               |
| agentInstancesMap       | Map<number, PolicySynthAgent>                | Maps agent IDs to their instantiated `PolicySynthAgent` processors.                         |
| agentStatusMap          | Map<number, PsAgentStatus>                   | Maps agent IDs to their current status objects.                                             |
| agentMemoryMap          | Map<number, PsAgentMemoryData>               | Maps agent IDs to their memory objects (loaded from Redis or initialized).                  |
| workers                 | Worker[]                                     | Array of BullMQ Worker instances for processing jobs.                                       |
| structuredAnswersOverrides | Array<any>                                | Optional overrides for structured answers, used during job processing.                      |
| skipCheckForProgress    | boolean                                      | If true, skips progress checks (default: true).                                             |
| redisClient             | ioredis                                      | The Redis client instance used for memory and status storage.                               |

## Abstract Properties

| Name            | Type                                                                                                   | Description                                                                                 |
|-----------------|--------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| processors      | Array<{ processor: new (...): PolicySynthAgent; weight: number }>                                      | List of agent processor classes and their weights for sequential processing.                |
| agentQueueName  | string                                                                                                 | The name of the BullMQ queue for this agent type.                                           |

## Abstract Methods

| Name                | Parameters                       | Return Type         | Description                                           |
|---------------------|----------------------------------|---------------------|-------------------------------------------------------|
| setupMemoryIfNeeded | agentId: number                  | Promise<void>       | Subclass-specific logic to set up agent memory.        |

## Methods

| Name                          | Parameters                                                                                 | Return Type                        | Description                                                                                                   |
|-------------------------------|--------------------------------------------------------------------------------------------|------------------------------------|---------------------------------------------------------------------------------------------------------------|
| constructor                   | none                                                                                       | PolicySynthAgentQueue              | Initializes the queue and Redis connection.                                                                   |
| initializeRedis               | none                                                                                       | void                               | Sets up the Redis client and event listeners.                                                                 |
| getOrCreatePsAgent            | agentId: number                                                                            | Promise<PsAgent>                   | Loads or retrieves a `PsAgent` from the database and caches it.                                               |
| getOrCreateAgentInstance      | agentId: number                                                                            | PolicySynthAgent                   | Instantiates or retrieves a `PolicySynthAgent` processor for the given agent.                                 |
| loadAgentMemoryIfNeeded       | agentId: number                                                                            | Promise<PsAgentMemoryData>         | Loads agent memory from Redis or initializes it if not present.                                               |
| processAllAgents              | agentId: number                                                                            | Promise<void>                      | Sequentially processes all agent processors for the given agent.                                              |
| loadAgentStatusFromRedis      | agentId: number                                                                            | Promise<PsAgentStatus \| undefined>| Loads agent status from Redis and caches it.                                                                  |
| saveAgentStatusToRedis        | agentId: number                                                                            | Promise<void>                      | Saves the current agent status to Redis.                                                                      |
| setupStatusIfNeeded           | agentId: number                                                                            | Promise<void>                      | Ensures agent status is initialized and saved in Redis.                                                       |
| setupAgentQueue               | none                                                                                       | Promise<void>                      | Sets up BullMQ workers and event listeners for the agent queue.                                               |
| updateAgentStatus             | agentId: number, state: "running" \| "stopped" \| "paused" \| "error", message?: string    | Promise<void>                      | Updates the agent's status and saves it to Redis.                                                             |
| pauseAllWorkersGracefully     | none                                                                                       | Promise<void>                      | Pauses all workers in the queue, letting in-flight jobs finish.                                               |

## Example

```typescript
import { PolicySynthAgentQueue } from '@policysynth/agents/base/agentQueue.js';

class MyCustomAgentQueue extends PolicySynthAgentQueue {
  get processors() {
    return [
      { processor: MyCustomAgentProcessor, weight: 100 }
    ];
  }

  get agentQueueName() {
    return "my-custom-agent-queue";
  }

  async setupMemoryIfNeeded(agentId: number) {
    // Custom memory setup logic for your agent
    const memory = await this.loadAgentMemoryIfNeeded(agentId);
    // ...initialize or modify memory as needed
  }
}

// Usage
const myQueue = new MyCustomAgentQueue();
myQueue.setupAgentQueue();
```

## Key Concepts

- **Agent Maps**: The class maintains several maps to cache agents, their instances, memory, and status for efficient access.
- **Redis Integration**: Agent memory and status are persisted in Redis for distributed processing and fault tolerance.
- **BullMQ Workers**: The class sets up BullMQ workers to process agent jobs concurrently, with event hooks for monitoring.
- **Extensibility**: Subclasses must define the `processors`, `agentQueueName`, and `setupMemoryIfNeeded` to specify agent processing logic.

## Type Details

- **PsAgent**: Represents an agent configuration and state, loaded from the database.
- **PolicySynthAgent**: The processor class that implements the agent's logic.
- **PsAgentStatus**: Tracks the agent's current state, progress, and messages.
- **PsAgentMemoryData**: Stores the agent's working memory, persisted in Redis.

---

This class is intended to be subclassed for each agent type, providing a robust, scalable foundation for distributed agent processing in PolicySynth.