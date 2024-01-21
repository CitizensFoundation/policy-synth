# Queue

The Queue class from the "bullmq" package is used to create and manage a queue of jobs for processing.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| name          | string | The name of the queue.    |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| constructor | name: string, opts?: QueueOptions, Connection?: ioredis | Queue | Initializes a new Queue instance with a given name, optional options, and a Redis connection. |
| add        | name: string, data: any, opts?: JobsOptions | Promise<Job> | Adds a new job to the queue. |

## Examples

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default("redis://localhost:6379");
const myQueue = new Queue("agent-policies");

// Adding a job to the queue
myQueue.add(
  "agent-policies",
  {
    groupId: "project-id",
    communityId: 1,
    domainId: 1,
  },
  { removeOnComplete: true, removeOnFail: true }
);
```

# IEngineInnovationMemoryData

This interface represents the structure of the memory data used in the innovation engine.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| currentStage  | string | The current stage of the innovation process. |

## Examples

```typescript
const memory: IEngineInnovationMemoryData = JSON.parse(output!);
```

# ioredis

The ioredis package is a robust, performance-focused, and full-featured Redis client for Node.js.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| constructor | options?: RedisOptions | Redis | Creates a new Redis instance with optional configuration options. |
| get        | key: string | Promise<string | null> | Gets the value of a key. |
| set        | key: string, value: string, options?: SetOptions | Promise<'OK' | null> | Sets the value of a key. |

## Examples

```typescript
import ioredis from "ioredis";

const redis = new ioredis.default("redis://localhost:6379");

// Getting a value from Redis
const output = await redis.get("someKey");

// Setting a value in Redis
await redis.set("someKey", "someValue");
```

Please note that the above documentation is a simplified representation of the actual classes and methods from the "bullmq" and "ioredis" packages. The actual usage may involve more parameters and options, and the behavior of the methods may vary based on the provided arguments.