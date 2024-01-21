# Queue

A class representing a job queue using BullMQ.

## Properties

No public properties documented.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| constructor | name: string, opts?: QueueOptions, Connection?: ioredis | Queue | Initializes a new instance of the Queue class with a given name, optional options, and an optional Redis connection. |

## Examples

```typescript
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default("redis://localhost:6379");
const myQueue = new Queue("agent-problems");
```

# IEngineInnovationMemoryData

This type represents the structure of the memory data used in the engine innovation process.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| currentStage  | string | The current stage of the engine innovation process. |

## Examples

```typescript
const memory = JSON.parse(output!) as IEngineInnovationMemoryData;
memory.currentStage = "create-problem-statement-image";
```

# Redis (ioredis)

A class representing a Redis client.

## Properties

No public properties documented.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| constructor | options?: RedisOptions | Redis | Initializes a new instance of the Redis client with optional configuration options. |
| get        | key: string       | Promise<string | null> | Retrieves the value of a key from Redis. |
| set        | key: string, value: string, options?: SetOptions | Promise<'OK' | null> | Sets the value of a key in Redis with optional settings. |

## Examples

```typescript
const redis = new ioredis.default("redis://localhost:6379");
const output = await redis.get(redisKey);
await redis.set(redisKey, JSON.stringify(memory));
```

# Additional Script Functionality

The script provided is a Node.js executable script that interacts with a Redis instance and a BullMQ queue. It retrieves a project's memory data from Redis, updates the current stage of the process, and then adds a job to the BullMQ queue.

## Examples

```typescript
const projectId = process.argv[2];

if (projectId) {
  // ... retrieve and update memory data, then add a job to the queue
} else {
  console.log("Usage: node runProblemStage <projectId>");
  process.exit(0);
}
```

**Note:** The provided script does not include a complete API documentation for all classes and methods used, as it seems to be a usage example rather than a library or module definition. The `Queue` class from BullMQ and the `Redis` class from ioredis are only partially documented with the constructor method. The `IEngineInnovationMemoryData` type is assumed to be an interface with a single property based on the usage context.