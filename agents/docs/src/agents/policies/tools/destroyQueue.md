# Queue

The `Queue` class from the `bullmq` library is used to create and manage a queue of jobs. It provides methods to add jobs to the queue, process them, and maintain the queue, such as draining and cleaning jobs in various states.

## Properties

This class instance does not explicitly define custom properties in the provided code snippet. It utilizes properties from the `bullmq` library's `Queue` class.

## Methods

| Name       | Parameters                  | Return Type | Description                                      |
|------------|-----------------------------|-------------|--------------------------------------------------|
| drain      | -                           | Promise<void> | Drains the queue, removing all jobs.             |
| clean      | grace: number, limit: number, status: string | Promise<void> | Cleans jobs from the queue based on their status and other parameters. |
| obliterate | -                           | Promise<void> | Completely removes the queue and all of its contents. |

## Examples

```typescript
import { Queue } from "bullmq";

// Create a new Queue instance
const myQueue = new Queue("agent-policies");

// Drain the queue, removing all jobs
await myQueue.drain();

// Clean jobs in various states with a grace period and limit
await myQueue.clean(0, 10000, "active");
await myQueue.clean(0, 10000, "failed");
await myQueue.clean(0, 10000, "completed");
await myQueue.clean(0, 10000, "wait");
await myQueue.clean(0, 10000, "delayed");

// Obliterate the queue, removing it completely
await myQueue.obliterate();

// Exit the process
process.exit(0);
```

Please note that the actual implementation of the `Queue` class and its methods are part of the `bullmq` library, and the provided code snippet only shows usage examples. The documentation for the `Queue` class should be consulted in the `bullmq` library documentation for more detailed information.