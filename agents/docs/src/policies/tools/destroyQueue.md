# DestroyQueue

This script is designed to manage and clean up a queue in a BullMQ system. It performs a series of operations to drain and clean the queue of jobs in various states before ultimately obliterating the queue.

## Methods

| Name   | Parameters                  | Return Type | Description                                                                 |
|--------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| drain  | -                           | Promise<void> | Drains the queue, removing all waiting jobs.                                |
| clean  | grace: number, limit: number, status: "active" \| "failed" \| "completed" \| "wait" \| "delayed" | Promise<void> | Cleans jobs in specified state older than grace period up to a limit count. |
| obliterate | options?: { force?: boolean, count?: number } | Promise<void> | Completely removes the queue and all of its data.                           |

## Example

```typescript
import { Queue } from "bullmq";

async function destroyQueue() {
  const myQueue = new Queue("agent-policies");

  // Drain the queue
  await myQueue.drain();

  // Clean the queue of jobs in various states
  await myQueue.clean(0, 10000, "active");
  await myQueue.clean(0, 10000, "failed");
  await myQueue.clean(0, 10000, "completed");
  await myQueue.clean(0, 10000, "wait");
  await myQueue.clean(0, 10000, "delayed");

  // Obliterate the queue
  await myQueue.obliterate();

  // Exit the process
  process.exit(0);
}

destroyQueue();
```

This example demonstrates how to use the `Queue` class from `bullmq` to manage a queue named "agent-policies". It includes draining the queue, cleaning jobs in various states, and finally obliterating the queue.