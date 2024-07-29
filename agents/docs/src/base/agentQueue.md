# PolicySynthAgentQueue

The `PolicySynthAgentQueue` class is an abstract class that extends the `PolicySynthAgent` class. It is designed to manage the lifecycle and processing of agents using a queue system backed by Redis and BullMQ. This class handles the initialization of Redis, loading and saving agent status, setting up the agent queue, and processing agents.

## Properties

| Name                  | Type            | Description                                                                 |
|-----------------------|-----------------|-----------------------------------------------------------------------------|
| status                | PsAgentStatus   | The current status of the agent.                                            |
| redisClient           | Redis           | The Redis client instance.                                                  |
| skipCheckForProgress  | boolean         | A flag to skip checking for progress. Default is `true`.                    |

## Constructor

The constructor initializes the `PolicySynthAgentQueue` instance, sets up the initial progress values, and initializes the Redis connection.

## Methods

### initializeRedis

Initializes the Redis connection using the URL specified in the environment variable `REDIS_AGENT_URL` or defaults to `redis://localhost:6379`.

```typescript
initializeRedis(): void
```

### loadAgentStatusFromRedis

Loads the agent status from Redis.

```typescript
async loadAgentStatusFromRedis(): Promise<PsAgentStatus>
```

### saveAgentStatusToRedis

Saves the current agent status to Redis.

```typescript
async saveAgentStatusToRedis(): Promise<void>
```

### setupStatusIfNeeded

Sets up the agent status if it is not already initialized.

```typescript
async setupStatusIfNeeded(): Promise<void>
```

### processAllAgents

Processes all agents in the queue by iterating through the processors and executing them.

```typescript
async processAllAgents(): Promise<void>
```

### setupAgentQueue

Sets up the agent queue using BullMQ's `Worker` and `QueueEvents`.

```typescript
async setupAgentQueue(): Promise<void>
```

### startAgent

Starts the agent by updating its status to "running" and processing all agents.

```typescript
async startAgent(): Promise<void>
```

### stopAgent

Stops the agent by updating its status to "stopped".

```typescript
async stopAgent(): Promise<void>
```

### pauseAgent

Pauses the agent by updating its status to "paused".

```typescript
async pauseAgent(): Promise<void>
```

### updateAgentStatus

Updates the agent's status and saves it to Redis.

```typescript
async updateAgentStatus(
  state: "running" | "stopped" | "paused" | "error",
  message?: string
): Promise<void>
```

## Abstract Properties

### processors

An abstract property that should return an array of processor configurations. Each configuration includes a processor class and its weight.

```typescript
abstract get processors(): Array<{
  processor: new (
    agent: PsAgent,
    memory: any,
    startProgress: number,
    endProgress: number
  ) => PolicySynthAgent;
  weight: number;
}>;
```

### agentQueueName

An abstract property that should return the name of the agent queue.

```typescript
abstract get agentQueueName(): string;
```

### setupMemoryIfNeeded

An abstract method that should set up the memory if needed.

```typescript
abstract setupMemoryIfNeeded(): Promise<void>;
```

## Example

```typescript
import { PolicySynthAgentQueue } from '@policysynth/agents/base/agentQueue.js';

class MyAgentQueue extends PolicySynthAgentQueue {
  get processors() {
    return [
      {
        processor: MyProcessor,
        weight: 50,
      },
      {
        processor: AnotherProcessor,
        weight: 50,
      },
    ];
  }

  get agentQueueName() {
    return 'my-agent-queue';
  }

  async setupMemoryIfNeeded() {
    // Custom memory setup logic
  }
}

const myAgentQueue = new MyAgentQueue();
myAgentQueue.setupAgentQueue();
```

This example demonstrates how to extend the `PolicySynthAgentQueue` class to create a custom agent queue with specific processors and memory setup logic.