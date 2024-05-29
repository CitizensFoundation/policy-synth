# DestroyQueue

This script is used to clean and obliterate a BullMQ queue named "agent-problems". It drains the queue and cleans jobs in various states before obliterating the queue.

## Example

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-problems");
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
| drain      | none              | Promise<void> | Drains the queue, removing all jobs. |
| clean      | grace: number, limit: number, type: string | Promise<number> | Cleans jobs from the queue based on their state. |
| obliterate | none              | Promise<void> | Completely removes the queue and all its jobs. |

## Example Usage

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-problems");
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

This script ensures that the queue is completely cleaned and removed, making it useful for scenarios where you need to reset the state of the queue or remove it entirely.