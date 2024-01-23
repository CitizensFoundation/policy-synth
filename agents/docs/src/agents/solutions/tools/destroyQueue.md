# Queue

The `Queue` class from the `bullmq` library is used to create and manage a queue of jobs. It provides various methods to interact with the queue, such as adding jobs, draining the queue, cleaning jobs in different states, and completely obliterating the queue.

## Properties

This class instance does not explicitly define properties in the provided code snippet. Properties would typically be defined within the class constructor or methods.

## Methods

| Name       | Parameters                  | Return Type | Description                                      |
|------------|-----------------------------|-------------|--------------------------------------------------|
| drain      | -                           | Promise<void> | Drains the queue, removing all jobs.             |
| clean      | grace: number, limit: number, status: 'active' \| 'failed' \| 'completed' \| 'wait' \| 'delayed' | Promise<number[]> | Cleans jobs from the queue based on their status. |
| obliterate | -                           | Promise<void> | Completely obliterates the queue.                |

## Examples

```typescript
import { Queue } from "bullmq";

// Create a new Queue instance
const myQueue = new Queue("agent-solutions");

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

Please note that the provided code snippet does not include the full implementation of the `Queue` class, and the actual class may contain additional properties and methods not listed here. The documentation above is based solely on the usage shown in the snippet.