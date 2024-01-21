# Queue

The `Queue` class from the `bullmq` library is used to create and manage a queue of jobs. It provides various methods to interact with the queue, such as adding jobs, draining the queue, cleaning jobs in different states, and completely obliterating the queue.

## Properties

This class does not expose public properties for direct access in the provided code snippet.

## Methods

| Name       | Parameters                        | Return Type | Description                                             |
|------------|-----------------------------------|-------------|---------------------------------------------------------|
| drain      |                                   | Promise<void> | Drains the queue, removing all jobs.                    |
| clean      | grace: number, limit: number, status: 'active' \| 'failed' \| 'completed' \| 'wait' \| 'delayed' | Promise<number[]> | Cleans jobs from the queue based on their status.       |
| obliterate |                                   | Promise<void> | Completely removes the queue and all of its contents.   |

## Examples

```typescript
import { Queue } from "bullmq";

// Create a new queue instance
const myQueue = new Queue("agent-policies");

// Drain the queue, removing all jobs
await myQueue.drain();

// Clean jobs in various states from the queue
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");

// Completely obliterate the queue
await myQueue.obliterate();

// Exit the process
process.exit(0);
```

Please note that the actual `Queue` class from `bullmq` may have more properties and methods than what is shown in the provided code snippet. The documentation above is based solely on the usage in the snippet.