# Queue

The `Queue` class from the `bullmq` library is used to manage job queues. This class provides methods to add jobs, process them, and maintain the queue, including cleaning and draining jobs.

## Methods

| Name       | Parameters                  | Return Type | Description                                           |
|------------|-----------------------------|-------------|-------------------------------------------------------|
| constructor| name: string, opts?: QueueOptions | Queue      | Initializes a new Queue instance with a given name and optional configuration options. |
| drain      |                             | Promise<void> | Drains the queue, removing all jobs.                 |
| clean      | grace: number, limit: number, status: JobStatus | Promise<Job[]> | Cleans jobs from the queue based on their status and age. |
| obliterate | options?: { force?: boolean, count?: number } | Promise<void> | Completely removes the queue and all of its data.    |

## Example

```typescript
import { Queue } from "bullmq";

const myQueue = new Queue("agent-policies");

// Drain all jobs from the queue
await myQueue.drain();

// Clean jobs by their status
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");

// Obliterate the queue, removing all data
await myQueue.obliterate();

process.exit(0);
```

This example demonstrates initializing a queue, draining it, cleaning jobs based on various statuses, and finally obliterating the queue. This is useful for managing job queues in applications that require robust job handling and cleanup mechanisms.