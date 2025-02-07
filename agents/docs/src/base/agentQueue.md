# PolicySynthAgentQueue

The `PolicySynthAgentQueue` is an abstract class designed to manage a queue of agents, allowing for the storage and processing of multiple agent implementations. It extends the `PolicySynthAgentBase` class and utilizes Redis for memory and status management.

## Properties

| Name                      | Type                                      | Description                                                                 |
|---------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| agentsMap                 | Map<number, PsAgent>                      | A map storing `PsAgent` instances keyed by agent ID.                        |
| agentInstancesMap         | Map<number, PolicySynthAgent>             | A map storing `PolicySynthAgent` instances keyed by agent ID.               |
| agentStatusMap            | Map<number, PsAgentStatus>                | A map storing the status of agents keyed by agent ID.                       |
| agentMemoryMap            | Map<number, PsAgentMemoryData>            | A map storing memory data for agents keyed by agent ID.                     |
| structuredAnswersOverrides| Array<any>                                | An array to store structured answers overrides.                             |
| skipCheckForProgress      | boolean                                   | A flag to skip checking for progress. Defaults to `true`.                   |
| redisClient               | ioredis                                   | An instance of the Redis client.                                            |

## Methods

| Name                        | Parameters                                                                 | Return Type            | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| constructor                 | -                                                                          | -                      | Initializes the Redis client and sets up the class.                         |
| get processors              | -                                                                          | Array                  | Abstract method to get the list of processors.                              |
| get agentQueueName          | -                                                                          | string                 | Abstract method to get the name of the agent queue.                         |
| setupMemoryIfNeeded         | agentId: number                                                            | Promise<void>          | Abstract method to set up memory for a given agent ID if needed.            |
| initializeRedis             | -                                                                          | void                   | Initializes the Redis connection.                                           |
| getOrCreatePsAgent          | agentId: number                                                            | Promise<PsAgent>       | Retrieves or loads a `PsAgent` from the database.                           |
| getOrCreateAgentInstance    | agentId: number                                                            | PolicySynthAgent       | Retrieves or creates a `PolicySynthAgent` instance.                         |
| loadAgentMemoryIfNeeded     | agentId: number                                                            | Promise<PsAgentMemoryData> | Loads agent memory from Redis if not already loaded.                    |
| processAllAgents            | agentId: number                                                            | Promise<void>          | Processes all agents in sequence.                                           |
| loadAgentStatusFromRedis    | agentId: number                                                            | Promise<PsAgentStatus \| undefined> | Loads agent status from Redis.                                |
| saveAgentStatusToRedis      | agentId: number                                                            | Promise<void>          | Saves agent status to Redis.                                                |
| setupStatusIfNeeded         | agentId: number                                                            | Promise<void>          | Sets up agent status if needed.                                             |
| setupAgentQueue             | -                                                                          | Promise<void>          | Sets up the agent queue and worker.                                         |
| startAgent                  | agentId: number                                                            | Promise<void>          | Starts an agent by updating its status to "running".                        |
| stopAgent                   | agentId: number                                                            | Promise<void>          | Stops an agent by updating its status to "stopped".                         |
| pauseAgent                  | agentId: number                                                            | Promise<void>          | Pauses an agent by updating its status to "paused".                         |
| updateAgentStatus           | agentId: number, state: "running" \| "stopped" \| "paused" \| "error", message?: string | Promise<void>          | Updates the status of an agent.                                             |

## Example

```typescript
import { PolicySynthAgentQueue } from '@policysynth/agents/base/agentQueue.js';

class MyAgentQueue extends PolicySynthAgentQueue {
  get processors() {
    return [
      {
        processor: MyAgentProcessor,
        weight: 100,
      },
    ];
  }

  get agentQueueName() {
    return "myAgentQueue";
  }

  async setupMemoryIfNeeded(agentId: number) {
    // Custom memory setup logic
  }
}

const myAgentQueue = new MyAgentQueue();
myAgentQueue.setupAgentQueue();
```