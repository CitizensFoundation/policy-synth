# destroyQueue

This script is designed to manage and clean up a queue in a BullMQ system. It performs a series of operations on a queue named "agent-policies", including draining the queue, cleaning it based on different job statuses, and finally obliterating the queue.

## Methods

| Name    | Parameters                  | Return Type | Description                                                                 |
|---------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| drain   | -                           | Promise<void> | Drains the queue, removing all jobs.                                        |
| clean   | grace: number, limit: number, status: "active" \| "failed" \| "completed" \| "wait" \| "delayed" | Promise<number[]> | Cleans jobs in the queue based on their status, within a grace period.      |
| obliterate | options?: { force?: boolean, count?: number } | Promise<void> | Completely removes the queue and all of its data.                           |

## Example

```javascript
import { Queue } from "bullmq";

// Initialize the queue
const myQueue = new Queue("agent-policies");

// Drain the queue
await myQueue.drain();

// Clean the queue based on job status
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

This example demonstrates how to use the `Queue` class from the `bullmq` package to manage a queue named "agent-policies". It includes draining the queue, cleaning it based on job status, and obliterating the queue entirely.