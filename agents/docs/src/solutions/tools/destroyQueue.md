# DestroyQueue

This script is used to clean and obliterate a BullMQ queue named "agent-solutions".

## Example

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-solutions");
await myQueue.drain();
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");
await myQueue.obliterate();
//await redis.del("st_mem:1:id");

process.exit(0);
```

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| drain      | none              | Promise<void> | Drains the queue, i.e., removes all jobs that are waiting. |
| clean      | grace: number, limit: number, type: string | Promise<number[]> | Cleans the queue by removing jobs of a specific type (active, failed, completed, wait, delayed) that are older than the grace period. |
| obliterate | none              | Promise<void> | Completely removes the queue and all its jobs. |

## Example Usage

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-solutions");

// Drain the queue
await myQueue.drain();

// Clean jobs of different types
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");

// Obliterate the queue
await myQueue.obliterate();

// Exit the process
process.exit(0);
```

This script ensures that the queue is completely cleaned and removed, making it useful for scenarios where you need to reset the state of the queue.