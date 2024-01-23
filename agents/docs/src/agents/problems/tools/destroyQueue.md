# Queue

The `Queue` class from the `bullmq` library is used to create and manage a queue of jobs. It provides methods to add jobs to the queue, process them, and maintain the queue, such as cleaning and draining jobs.

## Properties

This class instance does not explicitly define properties in the provided code snippet. Properties would typically be defined within the class constructor or methods.

## Methods

| Name       | Parameters                  | Return Type | Description                                      |
|------------|-----------------------------|-------------|--------------------------------------------------|
| drain      | -                           | Promise<void> | Drains the queue, removing all jobs.             |
| clean      | grace: number, limit: number, status: string | Promise<void> | Cleans jobs from the queue based on their status and other parameters. |
| obliterate | -                           | Promise<void> | Completely removes the queue and all of its data. |

## Examples

```typescript
import { Queue } from "bullmq";

// Create a new queue instance
const myQueue = new Queue("agent-problems");

// Drain the queue, removing all jobs
await myQueue.drain();

// Clean jobs in different states with a grace period and limit
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

Please note that the actual implementation of the `Queue` class may include more properties and methods than what is shown in the provided code snippet. The documentation above is based solely on the usage examples given.