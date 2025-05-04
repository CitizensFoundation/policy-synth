# PolicySynthAgentQueue

An abstract base class for managing and processing PolicySynth agents in a distributed queue system using Redis and BullMQ. This class handles agent instance management, memory/state persistence, job processing, and worker orchestration for scalable agent execution.

**File:** `@policysynth/agents/base/agentQueue.js`

---

## Properties

| Name                     | Type                                         | Description                                                                                   |
|--------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| agentsMap                | `Map<number, PsAgent>`                       | Maps agent IDs to loaded `PsAgent` database instances.                                        |
| agentInstancesMap        | `Map<number, PolicySynthAgent>`              | Maps agent IDs to their instantiated `PolicySynthAgent` objects.                              |
| agentStatusMap           | `Map<number, PsAgentStatus>`                 | Maps agent IDs to their current status objects.                                               |
| agentMemoryMap           | `Map<number, PsAgentMemoryData>`             | Maps agent IDs to their memory/state objects.                                                 |
| workers                  | `Worker[]`                                   | Array of BullMQ `Worker` instances for job processing.                                        |
| structuredAnswersOverrides | `Array<any> \| undefined`                  | Optional overrides for structured answers, used during agent execution.                       |
| skipCheckForProgress     | `boolean`                                    | If true, skips progress checks (default: `true`).                                             |
| redisClient              | `ioredis.Redis`                              | The Redis client instance used for state and memory persistence.                              |

---

## Abstract Properties

| Name            | Type                                                                                                   | Description                                                                                 |
|-----------------|--------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| processors      | `Array<{ processor: new (agent: PsAgent, memory: any, startProgress: number, endProgress: number) => PolicySynthAgent; weight: number; }>` | List of agent processor classes and their weights for staged agent processing.              |
| agentQueueName  | `string`                                                                                               | The name of the BullMQ queue for this agent type.                                           |

---

## Methods

| Name                              | Parameters                                                                                       | Return Type                        | Description                                                                                                   |
|----------------------------------- |--------------------------------------------------------------------------------------------------|------------------------------------|---------------------------------------------------------------------------------------------------------------|
| constructor                       | —                                                                                                | —                                  | Initializes the queue, sets up Redis connection, and base properties.                                         |
| initializeRedis                   | —                                                                                                | `void`                             | Initializes the Redis client and sets up event listeners for connection state.                                |
| getOrCreatePsAgent                | `agentId: number`                                                                                | `Promise<PsAgent>`                 | Loads a `PsAgent` from the DB (with all relations) or retrieves it from cache.                               |
| getOrCreateAgentInstance          | `agentId: number`                                                                                | `PolicySynthAgent`                 | Instantiates or retrieves a `PolicySynthAgent` for the given agent ID.                                       |
| loadAgentMemoryIfNeeded           | `agentId: number`                                                                                | `Promise<PsAgentMemoryData>`       | Loads agent memory from Redis or initializes it if not present.                                               |
| processAllAgents                  | `agentId: number`                                                                                | `Promise<void>`                    | Runs all processors in sequence for the agent, updating progress.                                             |
| loadAgentStatusFromRedis          | `agentId: number`                                                                                | `Promise<PsAgentStatus \| undefined>` | Loads agent status from Redis and caches it.                                                                  |
| saveAgentStatusToRedis            | `agentId: number`                                                                                | `Promise<void>`                    | Saves the current agent status to Redis.                                                                      |
| setupStatusIfNeeded               | `agentId: number`                                                                                | `Promise<void>`                    | Ensures agent status is initialized and persisted.                                                            |
| setupAgentQueue                   | —                                                                                                | `Promise<void>`                    | Sets up BullMQ workers and event listeners for the agent queue.                                               |
| updateAgentStatus                 | `agentId: number, state: "running" \| "stopped" \| "paused" \| "error", message?: string`        | `Promise<void>`                    | Updates the agent's status and persists it to Redis.                                                          |
| pauseAllWorkersGracefully         | —                                                                                                | `Promise<void>`                    | Pauses all workers in the queue, waiting for in-flight jobs to finish.                                        |
| setupMemoryIfNeeded (abstract)    | `agentId: number`                                                                                | `Promise<void>`                    | Abstract: Subclass must implement memory setup for the agent.                                                 |

---

## Example

```typescript
import { PolicySynthAgentQueue } from '@policysynth/agents/base/agentQueue.js';

class MyCustomAgentQueue extends PolicySynthAgentQueue {
  get processors() {
    return [
      {
        processor: MyCustomAgentProcessor, // extends PolicySynthAgent
        weight: 100,
      },
    ];
  }

  get agentQueueName() {
    return "my-custom-agent-queue";
  }

  async setupMemoryIfNeeded(agentId: number) {
    // Custom memory setup logic for your agent
    const memory = await this.loadAgentMemoryIfNeeded(agentId);
    // ...initialize or patch memory as needed
  }
}

// Usage
const queue = new MyCustomAgentQueue();
queue.setupAgentQueue(); // Sets up workers and event listeners

// To add a job (elsewhere in your code):
// queue.addJob({ agentId: 123, action: "start" });
```

---

## Notes

- **Subclassing:** You must implement the abstract `setupMemoryIfNeeded(agentId: number)` method and provide the `processors` and `agentQueueName` properties.
- **Persistence:** Agent memory and status are persisted in Redis for resilience and distributed processing.
- **Worker Management:** The class manages BullMQ workers, event listeners, and provides graceful pausing.
- **Agent Processing:** Supports multi-stage agent processing via the `processors` array, each with a weight for progress tracking.
- **Error Handling:** Errors in job processing are logged and propagated for monitoring.

---

## Related Types

- `PsAgent`, `PolicySynthAgent`, `PsAgentStatus`, `PsAgentMemoryData` (see project type definitions)
- `Worker`, `Job` from BullMQ
- `ioredis.Redis` for Redis client

---

This class is designed for advanced agent orchestration in scalable, distributed AI/automation systems. Subclass it to implement your own agent queue logic and processing pipelines.